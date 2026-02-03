import express from "express";
import type { Router } from "express";
import User from "../../lib/models/Users";
import { maskUserID } from '../../lib/mask';

const router: Router = express.Router();

router.post('/', async (req, res) => {
    const { UserID, source, enabled, data } = req.body;

    const maskedID = maskUserID(UserID?.toUpperCase() || '');

    if (!['vitol', 'moodle'].includes(source)) {
        return res.status(400).json({ error: 'Invalid source' });
    }

    const update: any = {
        'notifications.enabled': true,
        [`notifications.sources.${source}.enabled`]: enabled,
    };

    if (enabled && Array.isArray(data)) {
        update[`notifications.sources.${source}.data`] = data;
    }

    if (!enabled) {
        update[`notifications.sources.${source}.data`] = [];
    }

    await User.updateOne(
        { UserID: maskedID },
        { $set: update },
        { upsert: true }
    );

    res.json({ success: true });
});

export default router;