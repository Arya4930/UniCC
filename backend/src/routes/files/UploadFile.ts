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
