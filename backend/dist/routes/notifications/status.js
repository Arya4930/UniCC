"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Users_1 = __importDefault(require("../../lib/models/Users"));
const mask_1 = require("../../lib/mask");
const router = express_1.default.Router();
router.get("/", async (req, res) => {
    const { UserID } = req.query;
    if (!UserID) {
        return res.status(400).json({ error: "UserID required" });
    }
    const maskedID = (0, mask_1.maskUserID)(String(UserID).toUpperCase());
    const user = await Users_1.default.findOne({ UserID: maskedID });
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
exports.default = router;
//# sourceMappingURL=status.js.map