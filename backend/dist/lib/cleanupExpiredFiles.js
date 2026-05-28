"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startCleanupCron = startCleanupCron;
const node_cron_1 = __importDefault(require("node-cron"));
const Users_1 = __importDefault(require("./models/Users"));
;
const mongodb_1 = require("./clients/mongodb");
const s3_1 = require("./clients/s3");
async function cleanup() {
    console.log("🧹 Running cleanup task…");
    try {
        await (0, mongodb_1.connectDB)();
        const users = await Users_1.default.find();
        const now = new Date();
        for (const user of users) {
            const expiredFiles = user.files.filter(f => f.expiresAt < now);
            for (const file of expiredFiles) {
                try {
                    await (0, s3_1.DeleteFromS3)(file.fileID);
                }
                catch (err) {
                    console.error("❌ Failed to delete from S3:", err);
                }
            }
            await Users_1.default.updateOne({ _id: user._id }, {
                $set: {
                    files: user.files.filter(f => f.expiresAt > now)
                }
            });
        }
        console.log("✨ Cleanup completed.");
    }
    catch (err) {
        console.error("Cleanup Failed:", err);
    }
}
function startCleanupCron() {
    node_cron_1.default.schedule("0 * * * *", cleanup);
    cleanup();
}
//# sourceMappingURL=cleanupExpiredFiles.js.map