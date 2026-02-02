import webpush from 'web-push';
import express from "express";
import type { Router } from "express";
import User from "../../lib/models/Users";
import { maskUserID } from '../../lib/mask';

const router: Router = express.Router();

router.post("/", async (req, res) => {
    const { UserID, title, message } = req.body;

    const maskedID = maskUserID(UserID?.toUpperCase() || "");

    const user = await User.findOne({ UserID: maskedID });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const payload = JSON.stringify({
        title,
        body: message,
    });

    await Promise.all(
        user.pushSubscriptions.map(async (sub) => {
            try {
                await webpush.sendNotification(sub, payload);
            } catch (err: any) {
                if (err.statusCode === 410) {
                    await User.updateOne(
                        { UserID: maskedID },
                        { $pull: { pushSubscriptions: { endpoint: sub.endpoint } } }
                    );
                }
            }
        })
    );

    res.json({ success: true });
});

export default router;