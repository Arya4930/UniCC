import express from "express";
import type { Router } from "express";
import User from "../../lib/models/Users";
import webpush from 'web-push';
import { maskUserID } from '../../lib/mask';
import rateLimit from "express-rate-limit";

type NotificationSource = 'vitol' | 'moodle';

const testNotificationLimiter = rateLimit({
  windowMs: 30 * 60 * 1000,
  max: 3,
  message: { error: 'Too many test notifications, try again later' },
});

const router: Router = express.Router();

router.post('/', testNotificationLimiter, async (req, res) => {
    const { UserID } = req.body;
    const source = req.body.source as NotificationSource;
    const maskedID = maskUserID(UserID?.toUpperCase() || '');

    const user = await User.findOne({ UserID: maskedID });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const payload = JSON.stringify({
        title: `${source.toUpperCase()} Testing`,
        body: "Testing notification for " + source,
    });

    await Promise.all(
        user.pushSubscriptions.map(sub =>
            webpush.sendNotification(sub, payload)
        )
    );

    res.json({ success: true });
});

export default router;