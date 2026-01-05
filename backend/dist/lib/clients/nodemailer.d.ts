import { Transporter } from 'nodemailer';
import SMTPTransport from "nodemailer/lib/smtp-transport";
export declare const mailTransporter: Transporter<SMTPTransport.SentMessageInfo>;
export declare function verifyMailer(): Promise<void>;
//# sourceMappingURL=nodemailer.d.ts.map