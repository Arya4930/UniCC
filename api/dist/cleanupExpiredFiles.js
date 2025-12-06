"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCleanupCron = registerCleanupCron;
const node_cron_1 = __importDefault(require("node-cron"));
const Users_1 = __importDefault(require("./models/Users"));
const mongodb_1 = require("./mongodb");
const s3_1 = require("./s3");
async function cleanup() {
    console.log("🧹 Running cleanup task…");
    try {
        await (0, mongodb_1.connectDB)();
        const users = await Users_1.default.find();
        const now = new Date();
        for (const user of users) {
            const expiredFiles = user.files.filter(f => f.expiresAt < now);
            if (expiredFiles.length > 0) {
                console.log(`User ${user.UserID} has ${expiredFiles.length} expired file(s).`);
            }
            for (const file of expiredFiles) {
                try {
                    await (0, s3_1.DeleteFromS3)(file.fileID);
                    console.log(`🗑️ Deleted from S3: ${file.fileID}`);
                }
                catch (err) {
                    console.error("❌ Error deleting from S3:", err);
                }
            }
            user.files = user.files.filter(f => f.expiresAt > now);
            await user.save();
        }
        console.log("✨ Cleanup completed.");
    }
    catch (err) {
        console.error("❌ Cleanup failed:", err);
    }
}
function registerCleanupCron() {
    node_cron_1.default.schedule("0 * * * *", cleanup);
    cleanup();
}
registerCleanupCron();
//# sourceMappingURL=cleanupExpiredFiles.js.map