"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongodb_1 = require("../../mongodb");
const mask_1 = require("../../mask");
const Users_1 = __importDefault(require("../../models/Users"));
const s3_1 = require("../../s3");
const router = express_1.default.Router({ mergeParams: true });
router.get("/", async (req, res) => {
    try {
        await (0, mongodb_1.connectDB)();
        const { userID, fileID } = req.params;
        const maskedID = (0, mask_1.maskUserID)(userID);
        const user = await Users_1.default.findOne({ UserID: maskedID });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const file = user.files.find((f) => f.fileID === fileID);
        if (!file) {
            return res.status(404).json({ error: "File not found" });
        }
        if (file.expiresAt && new Date(file.expiresAt) < new Date()) {
            return res.status(410).json({ error: "File has expired" });
        }
        await (0, s3_1.StreamFileFromS3)(fileID, res, file.name);
    }
    catch (error) {
        console.error("Download Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.default = router;
//# sourceMappingURL=downloadFile.js.map