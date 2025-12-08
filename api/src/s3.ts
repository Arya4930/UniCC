import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import "dotenv/config";

const s3 = new S3Client({
  region: process.env.B2_REGION!,
  endpoint: process.env.B2_ENDPOINT!,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.B2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.B2_SECRET_ACCESS_KEY!,
  }
});

export async function UploadFileToS3(
  file: Express.Multer.File,
  key: string
): Promise<void> {
  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.B2_BUCKET_NAME!,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    })
  );
}

export async function DeleteFromS3(key: string): Promise<void> {
  await s3.send(
    new DeleteObjectCommand({
      Bucket: process.env.B2_BUCKET_NAME!,
      Key: key,
    })
  );
}

export async function StreamFileFromS3(key: string, res: any, filename: string): Promise<void> {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.B2_BUCKET_NAME!,
      Key: key,
    });
    const data = await s3.send(command);

    if(!data.Body) {
      return res.status(404).json({ error: "File not found in storage" });
    }

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', data.ContentType || 'application/octet-stream');

    (data.Body as any).pipe(res);
  } catch (error) {
    console.error("Error streaming file from S3:", error);
    res.status(500).json({ error: "Failed to stream file" });
  }
}