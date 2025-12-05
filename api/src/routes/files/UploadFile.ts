import express from 'express';
import type { Router } from 'express';
import multer from 'multer';
import path from 'path';
import User from '../../models/Users';
import { UploadFileToS3 } from '../../s3';
import { v4 as uuidv4 } from 'uuid';
import { connectDB } from '../../mongodb';

const router: Router = express.Router({ mergeParams: true });
const upload = multer();

const MAX_STORAGE = 1 * 1024 * 1024; // 1 MB

router.post("/", upload.single("file"), async (req, res) => {
    try {
        await connectDB();

        const { userID } = req.params;
        const file = req.file;

        if (!file) return res.status(400).json({ error: "No file uploaded" });

        let user = await User.findOne({ UserID: userID });
        if (!user) {
            user = await User.create({ UserID: userID, files: [] });
        }

        const currentStorage = user.files.reduce((acc, f) => acc + f.size, 0);

        if (currentStorage + file.size > MAX_STORAGE) {
            return res.status(400).json({ error: "Storage limit exceeded" });
        }

        const extension = path.extname(file.originalname);
        const cleanName = path.basename(file.originalname, extension);
        const uniqueKey = `${userID}/${uuidv4()}-${cleanName}${extension}`;

        await UploadFileToS3(file as any, uniqueKey);

        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

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
        });

    } catch (err) {
        console.error("Upload Error:", err);
        res.status(500).json({ error: "Upload failed" });
    }
});

export default router;
