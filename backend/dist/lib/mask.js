"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.maskUserID = maskUserID;
exports.maskIP = maskIP;
const node_crypto_1 = require("node:crypto");
require("dotenv/config");
const SALT = process.env.ID_SALT;
function maskUserID(userID) {
    return (0, node_crypto_1.createHmac)("sha256", SALT)
        .update(userID)
        .digest("hex")
        .substring(0, 16);
}
function maskIP(ipAddress) {
    return (0, node_crypto_1.createHmac)("sha256", SALT)
        .update(ipAddress)
        .digest("hex")
        .substring(0, 32);
}
//# sourceMappingURL=mask.js.map