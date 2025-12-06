"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadFileToS3 = UploadFileToS3;
exports.DeleteFromS3 = DeleteFromS3;
const client_s3_1 = require("@aws-sdk/client-s3");
require("dotenv/config");
const s3 = new client_s3_1.S3Client({
    region: process.env.B2_REGION,
    endpoint: process.env.B2_ENDPOINT,
    forcePathStyle: true,
    credentials: {
        accessKeyId: process.env.B2_ACCESS_KEY_ID,
        secretAccessKey: process.env.B2_SECRET_ACCESS_KEY,
    },
    maxRetries: 0,
    requestChecksumCalculation: 'WHEN_REQUIRED',
    responseChecksumValidation: 'WHEN_REQUIRED'
});
async function UploadFileToS3(file, key) {
    await s3.send(new client_s3_1.PutObjectCommand({
        Bucket: process.env.B2_BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
    }));
}
async function DeleteFromS3(key) {
    await s3.send(new client_s3_1.DeleteObjectCommand({
        Bucket: process.env.B2_BUCKET_NAME,
        Key: key,
    }));
}
//# sourceMappingURL=s3.js.map