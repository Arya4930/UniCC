"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Users_1 = __importDefault(require("../../models/Users"));
const s3_1 = require("../../s3");
const mongodb_1 = require("../../mongodb");
const router = express_1.default.Router({ mergeParams: true });
router.get("/", async (req, res) => {
    try {
        await (0, mongodb_1.connectDB)();
        const { userID, fileID } = req.params;
        const user = await Users_1.default.findOne({ UserID: userID });
        if (!user)
            return res.status(404).json({ error: "User not found" });
        const file = user.files.find(f => f.fileID === fileID);
        if (!file)
            return res.status(404).json({ error: "File not found" });
        if (file.expiresAt < new Date()) {
            return res.status(410).json({ error: "File expired" });
        }
        const { buffer, contentType } = await (0, s3_1.DownloadFileFromS3)(fileID);
        res.setHeader("Content-Disposition", `attachment; filename="${file.name}"`);
        res.setHeader("Content-Type", contentType || "application/octet-stream");
        res.send(buffer);
    }
    catch (err) {
        console.error("Download Error:", err);
        res.status(500).json({ error: "Download failed" });
    }
});
exports.default = router;
//# sourceMappingURL=downloadFile.js.map