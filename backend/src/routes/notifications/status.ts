import express from "express";
import type { Router } from "express";
import User from "../../lib/models/Users";
import { maskUserID } from "../../lib/mask";

const router: Router = express.Router();

router.get("/", async (req, res) => {
    const { UserID } = req.query;

    if (!UserID) {
        return res.status(400).json({ error: "UserID required" });
    }

    const maskedID = maskUserID(String(UserID).toUpperCase());
    const user = await User.findOne({ UserID: maskedID });

    if (!user || !user.notifications) {
        return res.json({
            vitol: false,
            moodle: false,
        });
    }

    res.json({
        vitol: !!user.notifications.sources?.vitol?.enabled,
        moodle: !!user.notifications.sources?.moodle?.enabled,
    });
});

export default router;
