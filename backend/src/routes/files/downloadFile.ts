import { Router } from "express";
import express from "express";
import { connectDB } from "../../lib/clients/mongodb";
import { maskUserID } from "../../lib/mask";
import User from "../../lib/models/Users";
import { StreamFileFromS3 } from "../../lib/clients/s3";

const router: Router = express.Router({ mergeParams: true });

router.get("/:userID/:fileID", async (req, res) => {
    try {
        await connectDB();
        const { userID, fileID } = req.params;

        const maskedID = maskUserID(userID.toUpperCase());

        const user = await User.findOne({ UserID: maskedID });
        if(!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const file = user.files.find((f) => f.fileID === fileID);
        if(!file) {
            return res.status(404).json({ error: "File not found" });
        }

        if(file.expiresAt && new Date(file.expiresAt) < new Date()) {
            return res.status(410).json({ error: "File has expired" });
        }

        await StreamFileFromS3(fileID, res, file.name);
    } catch (error) {
        console.error("Download Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
})

export default router