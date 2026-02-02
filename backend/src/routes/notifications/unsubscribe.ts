import express from "express";
import type { Router } from "express";
import User from "../../lib/models/Users";
import { maskUserID } from "../../lib/mask";

const router: Router = express.Router();

router.post("/", async (req, res) => {
    const { UserID, endpoint } = req.body;
    const maskedID = maskUserID(UserID?.toUpperCase() || "");

    await User.updateOne(
        { UserID: maskedID },
        {
            $pull: {
                pushSubscriptions: { endpoint }
            }
        }
    );

    res.json({ success: true });
});

export default router;