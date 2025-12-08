import "dotenv/config";
export declare function UploadFileToS3(file: Express.Multer.File, key: string): Promise<void>;
export declare function DeleteFromS3(key: string): Promise<void>;
export declare function StreamFileFromS3(key: string, res: any, filename: string): Promise<void>;
//# sourceMappingURL=s3.d.ts.map