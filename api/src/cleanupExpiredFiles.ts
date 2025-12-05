import cron from "node-cron";
import User from "./models/Users";
import { connectDB } from "./mongodb";
import { DeleteFromS3 } from "./s3";

async function cleanup() {
    console.log("🧹 Running cleanup task…");

    try {
        await connectDB();

        const users = await User.find();
        const now = new Date();

        for (const user of users) {
            const expiredFiles = user.files.filter(f => f.expiresAt < now);

            if (expiredFiles.length > 0) {
                console.log(`User ${user.UserID} has ${expiredFiles.length} expired file(s).`);
            }

            for (const file of expiredFiles) {
                try {
                    await DeleteFromS3(file.fileID);
                    console.log(`🗑️ Deleted from S3: ${file.fileID}`);
                } catch (err) {
                    console.error("❌ Error deleting from S3:", err);
                }
            }

            user.files = user.files.filter(f => f.expiresAt > now);
            await user.save();
        }

        console.log("✨ Cleanup completed.");
    } catch (err) {
        console.error("❌ Cleanup failed:", err);
    }
}

export function registerCleanupCron() {
    cron.schedule("0 * * * *", cleanup);
    cleanup();
}

registerCleanupCron();