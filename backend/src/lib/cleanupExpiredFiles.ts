import cron from "node-cron";
import User from "./models/Users";;
import { connectDB } from "./clients/mongodb";
import { DeleteFromS3 } from "./clients/s3";

async function cleanup() {
    console.log("🧹 Running cleanup task…");
    try {
        await connectDB();

        const users = await User.find();
        const now = new Date();

        for (const user of users) {
            const expiredFiles = user.files.filter(f => f.expiresAt < now);

            for (const file of expiredFiles) {
                try {
                    await DeleteFromS3(file.fileID);
                } catch (err) {
                    console.error("❌ Failed to delete from S3:", err);
                }
            }

            await User.updateOne(
                { _id: user._id },
                {
                    $set: {
                        files: user.files.filter(f => f.expiresAt > now)
                    }
                }
            );
        }

        console.log("✨ Cleanup completed.");
    } catch (err) {
        console.error("Cleanup Failed:", err);
    }
}

export function startCleanupCron() {
    cron.schedule("0 * * * *", cleanup);
    cleanup();
}
