import express, { Request } from 'express';
import type { Router } from 'express';
import multer from 'multer';
import path from 'path';
import User from '../../lib/models/Users';
import { UploadFileToS3 } from '../../lib/clients/s3';
import { v4 as uuidv4 } from 'uuid';
import { connectDB } from '../../lib/clients/mongodb';
import { maskUserID } from '../../lib/mask';

interface MulterRequest extends Request {
    file?: Express.Multer.File;
}

const router: Router = express.Router({ mergeParams: true });

/**
 * @openapi
 * /api/files/upload/{userID}:
 *   post:
 *     tags:
 *       - Files
 *     security: []
 *     summary: Upload a file for a user
 *     parameters:
 *       - in: path
 *         name: userID
 *         required: true
 *         schema:
 *           type: string
 *           example: 24BCE1234
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: File uploaded successfully
 *                 file:
 *                   type: object
 *                   properties:
 *                     fileID:
 *                       type: string
 *                       example: maskedID/uuid-filename.pdf
 *                     extension:
 *                       type: string
 *                       example: pdf
 *                     name:
 *                       type: string
 *                       example: notes.pdf
 *                     size:
 *                       type: number
 *                       example: 102400
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
 *                 storageUsed:
 *                   type: number
 *                   example: 204800
 *                 isAdmin:
 *                   type: boolean
 *                   example: false
 *       400:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Storage limit exceeded
 *       500:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Upload failed
 */

const upload = multer();

const MAX_STORAGE = 5 * 1024 * 1024;
const ADMINS = (process.env.ADMINS || "").split(",").map(id => id.trim());

router.post("/:userID", upload.single("file"), async (req, res) => {
    try {
        await connectDB();

        const { userID } = req.params;
        const maskedID = maskUserID(userID?.toUpperCase() || "");
        const file = (req as MulterRequest).file;
        if (!file) return res.status(400).json({ error: "No file uploaded" });

        const isAdmin = ADMINS.includes(userID?.toUpperCase() || "");
        let user = await User.findOne({ UserID: maskedID });
        
        if (!user) {
            user = await User.create({ UserID: maskedID, files: [] });
        }

        const currentStorage = user.files.reduce((acc, f) => acc + f.size, 0);
        if (!isAdmin && currentStorage + file.size > MAX_STORAGE) {
            return res.status(400).json({ error: "Storage limit exceeded" });
        }

        const extension = path.extname(file.originalname);
        const cleanName = path.basename(file.originalname, extension);
        const uniqueKey = `${maskedID}/${uuidv4()}-${cleanName}${extension}`;

        await UploadFileToS3(file as any, uniqueKey);

        const expiresAt = isAdmin
            ? new Date("2099-12-31T23:59:59Z")
            : new Date(Date.now() + 24 * 60 * 60 * 1000);

        const newFile = {
            fileID: uniqueKey,
            extension: extension.replace(".", ""),
            name: file.originalname,
            size: file.size,
            expiresAt
        };

        user.files.push(newFile);
        await user.save();

        res.status(201).json({
            message: "File uploaded successfully",
            file: newFile,
            storageUsed: currentStorage + file.size,
            isAdmin
        });

    } catch (err) {
        console.error("Upload Error:", err);
        res.status(500).json({ error: "Upload failed" });
    }
});

export default router;
