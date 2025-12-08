import type { File as MulterFile } from 'multer';
import "dotenv/config";
export declare function UploadFileToS3(file: MulterFile, key: string): Promise<void>;
export declare function DeleteFromS3(key: string): Promise<void>;
export declare function StreamFileFromS3(key: string, res: any, filename: string): Promise<void>;
//# sourceMappingURL=s3.d.ts.map