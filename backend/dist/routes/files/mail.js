"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const nodemailer_1 = require("../../lib/clients/nodemailer");
const multer_1 = __importDefault(require("multer"));
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 25 * 1024 * 1024 },
});
const router = express_1.default.Router({ mergeParams: true });
router.post("/send", upload.array("files"), async (req, res) => {
    const to = req.body.email;
    const subject = req.body.subject;
    const files = req.files;
    if (!to || !files || files.length === 0) {
        return res.status(400).send("Email and files are required");
    }
    try {
        const attachment = files.map((file) => ({
            filename: file.originalname,
            content: file.buffer,
            contentType: file.mimetype,
        }));
        await nodemailer_1.mailTransporter.sendMail({
            from: `Unicc <${process.env.SMTP_USER}>`,
            to: to.toString(),
            subject: subject ? subject.toString() : "Files from Uni-cc",
            text: `Your files, sent on ${new Date().toLocaleString()}`,
            attachments: attachment,
        });
        res.status(200).send("Email sent successfully");
    }
    catch (error) {
        res.status(500).send("Failed to send email");
        console.error("Email Send Error:", error);
    }
});
exports.default = router;
//# sourceMappingURL=mail.js.map