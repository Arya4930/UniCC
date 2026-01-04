"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mailTransporter = void 0;
exports.verifyMailer = verifyMailer;
const nodemailer_1 = __importDefault(require("nodemailer"));
const smtpConfig = {
    host: process.env.SMTP_HOST,
    port: 465,
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
};
exports.mailTransporter = nodemailer_1.default.createTransport(smtpConfig);
async function verifyMailer() {
    try {
        await exports.mailTransporter.verify();
        console.log("📩 Mailer is ready to send emails");
    }
    catch (error) {
        console.error("Error verifying mailer:", error);
    }
}
//# sourceMappingURL=nodemailer.js.map