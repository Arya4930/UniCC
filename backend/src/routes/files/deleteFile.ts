import type { Router } from "express";
import express from "express";
import { connectDB } from "../../lib/clients/mongodb";
import User from "../../lib/models/Users";
import { DeleteFromS3 } from "../../lib/clients/s3";
import { maskUserID } from "../../lib/mask";

const router: Router = express.Router({ mergeParams: true });

router.delete("/:userID/:fileID", async (req, res) => {
    try {
        await connectDB();
        const { userID, fileID } = req.params;

        const maskedID = maskUserID(userID.toUpperCase());

        const user = await User.findOne({ UserID: maskedID });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const file = user.files.find((f) => f.fileID === fileID);
        if (!file) {
            return res.status(404).json({ error: "File not found" });
        }

        try {
            await DeleteFromS3(fileID);
        } catch (error) {
            console.error("Error deleting file from S3:", error);
            return res.status(500).json({ error: "Failed to delete file from storage" });
        }

        user.files = user.files.filter((f) => f.fileID !== fileID);
        await user.save();

        const storageUsed = user.files.reduce((acc, f) => acc + f.size, 0);

        res.json({
            message: "File deleted successfully",
            storageUsed,
        });
    } catch (error) {
        console.error("Error deleting file:", error);
        res.status(500).json({ error: "Internal server error" });
    }
})

export default router;