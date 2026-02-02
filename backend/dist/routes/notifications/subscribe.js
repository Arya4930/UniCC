"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Users_1 = __importDefault(require("../../lib/models/Users"));
const mask_1 = require("../../lib/mask");
const router = express_1.default.Router();
router.post("/", async (req, res) => {
    const { UserID, subscription } = req.body;
    const maskedID = (0, mask_1.maskUserID)(UserID?.toUpperCase() || "");
    if (!subscription?.endpoint) {
        return res.status(400).json({ error: 'Invalid subscription' });
    }
    await Users_1.default.updateOne({ UserID: maskedID }, {
        $addToSet: {
            pushSubscriptions: subscription
        }
    });
    res.json({ success: true });
});
exports.default = router;
//# sourceMappingURL=subscribe.js.map