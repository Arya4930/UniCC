import express, { Request } from 'express';
import type { Router } from 'express';
import { mailTransporter } from "../../lib/clients/nodemailer";
import multer from 'multer';

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 25 * 1024 * 1024 },
});

const router: Router = express.Router({ mergeParams: true });

/**
 * @openapi
 * /api/mail/send:
 *   post:
 *     tags:
 *       - Files
 *     security: []
 *     summary: Send files via email
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - files
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               subject:
 *                 type: string
 *                 example: Important documents
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Email sent successfully
 *       400:
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Email and files are required
 *       500:
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Failed to send email
 */

router.post("/send", upload.array("files"), async (req, res) => {
    const to = req.body.email as String | undefined;
    const subject = req.body.subject as String | undefined;
    const files = req.files as Express.Multer.File[] | undefined;

    if (!to || !files || files.length === 0) {
        return res.status(400).send("Email and files are required");
    }
    try {
        const attachment = files.map((file) => ({
            filename: file.originalname,
            content: file.buffer,
            contentType: file.mimetype,
        }));

        await mailTransporter.sendMail({
            from: `Unicc <${process.env.SMTP_USER}>`,
            to: to.toString(),
            subject: subject ? subject.toString() : "Files from Uni-cc",
            text: `Your files, sent on ${new Date().toLocaleString()}`,
            attachments: attachment,
        });
        res.status(200).send("Email sent successfully");
    } catch (error) {
        res.status(500).send("Failed to send email");
        console.error("Email Send Error:", error);
    }
})

export default router;
