"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const Users_1 = __importDefault(require("../../models/Users"));
const s3_1 = require("../../s3");
const uuid_1 = require("uuid");
const mongodb_1 = require("../../mongodb");
const mask_1 = require("../../mask");
const router = express_1.default.Router({ mergeParams: true });
const upload = (0, multer_1.default)();
const MAX_STORAGE = 5 * 1024 * 1024;
const ADMINS = (process.env.ADMINS || "").split(",").map(id => id.trim());
router.post("/", upload.single("file"), async (req, res) => {
    try {
        await (0, mongodb_1.connectDB)();
        const { userID } = req.params;
        const maskedID = (0, mask_1.maskUserID)(userID.toUpperCase());
        const file = req.file;
        if (!file)
            return res.status(400).json({ error: "No file uploaded" });
        const isAdmin = ADMINS.includes(userID.toUpperCase());
        let user = await Users_1.default.findOne({ UserID: maskedID });
        if (!user) {
            user = await Users_1.default.create({ UserID: maskedID, files: [] });
        }
        const currentStorage = user.files.reduce((acc, f) => acc + f.size, 0);
        if (!isAdmin && currentStorage + file.size > MAX_STORAGE) {
            return res.status(400).json({ error: "Storage limit exceeded" });
        }
        const extension = path_1.default.extname(file.originalname);
        const cleanName = path_1.default.basename(file.originalname, extension);
        const uniqueKey = `${maskedID}/${(0, uuid_1.v4)()}-${cleanName}${extension}`;
        await (0, s3_1.UploadFileToS3)(file, uniqueKey);
        const expiresAt = isAdmin
            ? new Date("2099-12-31T23:59:59Z")
            : new Date(Date.now() + 24 * 60 * 60 * 1000);
        const newFile = {
            fileID: uniqueKey,
            extension: extension.replace(".", ""),
            name: file.originalname,
            size: file.size,
            expiresAt
        };
        user.files.push(newFile);
        await user.save();
        res.status(201).json({
            message: "File uploaded successfully",
            file: newFile,
            storageUsed: currentStorage + file.size,
            isAdmin
        });
    }
    catch (err) {
        console.error("Upload Error:", err);
        res.status(500).json({ error: "Upload failed" });
    }
});
exports.default = router;
//# sourceMappingURL=UploadFile.js.map