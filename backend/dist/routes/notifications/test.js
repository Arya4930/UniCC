"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Users_1 = __importDefault(require("../../lib/models/Users"));
const web_push_1 = __importDefault(require("web-push"));
const mask_1 = require("../../lib/mask");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const testNotificationLimiter = (0, express_rate_limit_1.default)({
    windowMs: 30 * 60 * 1000,
    max: 3,
    message: { error: 'Too many test notifications, try again later' },
});
const router = express_1.default.Router();
router.post('/', testNotificationLimiter, async (req, res) => {
    const { UserID } = req.body;
    const source = req.body.source;
    const maskedID = (0, mask_1.maskUserID)(UserID?.toUpperCase() || '');
    const user = await Users_1.default.findOne({ UserID: maskedID });
    if (!user)
        return res.status(404).json({ error: 'User not found' });
    const payload = JSON.stringify({
        title: `${source.toUpperCase()} Testing`,
        body: "Testing notification for " + source,
    });
    await Promise.all(user.pushSubscriptions.map(sub => web_push_1.default.sendNotification(sub, payload)));
    res.json({ success: true });
});
exports.default = router;
//# sourceMappingURL=test.js.map