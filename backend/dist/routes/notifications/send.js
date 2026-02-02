"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const web_push_1 = __importDefault(require("web-push"));
const express_1 = __importDefault(require("express"));
const Users_1 = __importDefault(require("../../lib/models/Users"));
const mask_1 = require("../../lib/mask");
const router = express_1.default.Router();
router.post("/", async (req, res) => {
    const { UserID, title, message } = req.body;
    const maskedID = (0, mask_1.maskUserID)(UserID?.toUpperCase() || "");
    const user = await Users_1.default.findOne({ UserID: maskedID });
    if (!user)
        return res.status(404).json({ error: 'User not found' });
    const payload = JSON.stringify({
        title,
        body: message,
    });
    await Promise.all(user.pushSubscriptions.map(async (sub) => {
        try {
            await web_push_1.default.sendNotification(sub, payload);
        }
        catch (err) {
            if (err.statusCode === 410) {
                await Users_1.default.updateOne({ UserID: maskedID }, { $pull: { pushSubscriptions: { endpoint: sub.endpoint } } });
            }
        }
    }));
    res.json({ success: true });
});
exports.default = router;
//# sourceMappingURL=send.js.map