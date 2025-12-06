"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.maskUserID = maskUserID;
const crypto_1 = __importDefault(require("crypto"));
require("dotenv/config");
const SALT = process.env.ID_SALT;
function maskUserID(userID) {
    return crypto_1.default
        .createHmac("sha256", SALT)
        .update(userID)
        .digest("hex")
        .substring(0, 16);
}
//# sourceMappingURL=mask.js.map