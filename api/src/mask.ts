import crypto from "crypto";
import "dotenv/config";

const SALT = process.env.ID_SALT!;

export function maskUserID(userID: string): string {
  return crypto
    .createHmac("sha256", SALT)
    .update(userID)
    .digest("hex")
    .substring(0, 16);
}
