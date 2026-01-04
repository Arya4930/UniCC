import nodemailer, { Transporter } from 'nodemailer';
import SMTPTransport from "nodemailer/lib/smtp-transport";

const smtpConfig: SMTPTransport.Options = {
    host: process.env.SMTP_HOST,
    port: 465,
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
};

export const mailTransporter: Transporter<SMTPTransport.SentMessageInfo> = nodemailer.createTransport(smtpConfig);

export async function verifyMailer(): Promise<void> {
    try {
        await mailTransporter.verify();
        console.log("📩 Mailer is ready to send emails");
    } catch (error) {
        console.error("Error verifying mailer:", error);
    }
}