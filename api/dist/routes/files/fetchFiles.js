"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Users_1 = __importDefault(require("../../models/Users"));
const mongodb_1 = require("../../mongodb");
const mask_1 = require("../../mask");
const router = express_1.default.Router({ mergeParams: true });
router.get("/", async (req, res) => {
    try {
        await (0, mongodb_1.connectDB)();
        const { userID } = req.params;
        const maskedID = (0, mask_1.maskUserID)(userID);
        let user = await Users_1.default.findOne({ UserID: maskedID });
        if (!user) {
            return res.json([]);
        }
        const now = new Date();
        user.files = user.files.filter(file => file.expiresAt > now);
        await user.save();
        res.json(user.files);
    }
    catch (error) {
        console.error("Error fetching files:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.default = router;
//# sourceMappingURL=fetchFiles.js.map