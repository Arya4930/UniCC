import { createHmac } from "node:crypto";
import "dotenv/config";

const SALT = process.env.ID_SALT!;

export function maskUserID(userID: string): string {
  return createHmac("sha256", SALT)
    .update(userID)
    .digest("hex")
    .substring(0, 16);
}

export function maskIP(ipAddress: string): string {
  return createHmac("sha256", SALT)
    .update(ipAddress)
    .digest("hex")
    .substring(0, 32);
}