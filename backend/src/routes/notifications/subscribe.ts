import express from "express";
import type { Router } from "express";
import User from "../../lib/models/Users";
import { maskUserID } from '../../lib/mask';

const router: Router = express.Router();

router.post("/", async (req, res) => {
    const { UserID, subscription } = req.body;
    const maskedID = maskUserID(UserID?.toUpperCase() || "");

    if (!subscription?.endpoint) {
        return res.status(400).json({ error: 'Invalid subscription' });
    }

    await User.updateOne(
        { UserID: maskedID },
        {
            $addToSet: {
                pushSubscriptions: subscription
            }
        }
    );

    res.json({ success: true });
});

export default router;