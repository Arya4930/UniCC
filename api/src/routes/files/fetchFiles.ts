import express from 'express';
import type { Router } from 'express';
import User from '../../models/Users';
import { connectDB } from '../../mongodb';
import { maskUserID } from '../../mask';

const router: Router = express.Router({ mergeParams: true });

router.get("/", async (req, res) => {
    try {
        await connectDB();
        const { userID } = req.params;
        const maskedID = maskUserID(userID.toUpperCase());

        let user = await User.findOne({ UserID: maskedID });

        if (!user) {
            return res.json([]);
        }

        const now = new Date();
        user.files = user.files.filter(file => file.expiresAt > now);
        await user.save();

        res.json(user.files);
    } catch (error) {
        console.error("Error fetching files:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

export default router;
