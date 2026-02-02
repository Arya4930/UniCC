"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.vitolReminder = vitolReminder;
const node_cron_1 = __importDefault(require("node-cron"));
const web_push_1 = __importDefault(require("web-push"));
const p_limit_1 = __importDefault(require("p-limit"));
const Users_1 = __importDefault(require("./models/Users"));
const limit = (0, p_limit_1.default)(20);
async function Reminder() {
    console.log('🔔 Running push reminder cron job');
    const users = await Users_1.default.find({ pushSubscriptions: { $ne: [] } });
    const payload = JSON.stringify({
        title: 'Reminder',
        body: 'This is a test reminder notification',
    });
    const tasks = [];
    for (const user of users) {
        for (const sub of user.pushSubscriptions) {
            tasks.push(limit(async () => {
                try {
                    await web_push_1.default.sendNotification(sub, payload);
                }
                catch (err) {
                    console.error('Push failed:', err.statusCode);
                    if (err.statusCode === 410 || err.statusCode === 404) {
                        await Users_1.default.updateOne({ UserID: user.UserID }, { $pull: { pushSubscriptions: { endpoint: sub.endpoint } } });
                    }
                }
            }));
        }
    }
    await Promise.all(tasks);
    console.log('✅ Push reminder cron finished');
}
function vitolReminder() {
    node_cron_1.default.schedule('0 * * * *', Reminder);
}
//# sourceMappingURL=VitolReminder.js.map