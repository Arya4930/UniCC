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
const ONE_HOUR = 60 * 60 * 1000;
const MOODLE_REMINDERS = [
    { key: '3d', ms: 3 * 24 * ONE_HOUR },
    { key: '1d', ms: 24 * ONE_HOUR },
    { key: '12h', ms: 12 * ONE_HOUR },
    { key: '6h', ms: 6 * ONE_HOUR },
    { key: '3h', ms: 3 * ONE_HOUR },
    { key: '1h', ms: ONE_HOUR },
];
const VITOL_REMINDERS = [
    { key: '6h', ms: 6 * ONE_HOUR },
    { key: '2h', ms: 2 * ONE_HOUR },
    { key: '30m', ms: 30 * 60 * 1000 },
];
function parseTime12h(time) {
    const [clock, modifier] = time.split(' ');
    let [hours, minutes] = clock?.split(':').map(Number) || [0, 0];
    if (!hours)
        hours = 0;
    if (!minutes)
        minutes = 0;
    if (modifier === 'PM' && hours !== 12)
        hours += 12;
    if (modifier === 'AM' && hours === 12)
        hours = 0;
    return { hours, minutes };
}
function shouldSend(target, offset) {
    const now = Date.now();
    const trigger = target.getTime() - offset;
    return now >= trigger;
}
function parseName(name) {
    const [, courseName, assignmentName] = name.split("/");
    return {
        courseName: courseName || "Course",
        assignmentName: assignmentName || name,
    };
}
async function Reminder() {
    console.log('🔔 Running reminder cron');
    const users = await Users_1.default.find({
        'notifications.enabled': true,
        pushSubscriptions: { $ne: [] },
    });
    for (const user of users) {
        const notificationsToSend = [];
        const moodle = user.notifications.sources.moodle;
        if (moodle?.enabled) {
            moodle.data = moodle.data.filter(item => !item.done);
            for (const item of moodle.data) {
                if (item.hidden)
                    continue;
                const due = item.due.split(',').map(e => e.trim());
                const dueTime = due[due.length - 1];
                const { hours, minutes } = parseTime12h(dueTime || "11:59 PM");
                const dueDate = new Date(item.year, item.month - 1, item.day, hours, minutes, 0, 0);
                const sortedReminders = [...MOODLE_REMINDERS].sort((a, b) => a.ms - b.ms);
                for (const r of sortedReminders) {
                    item.reminders ??= new Map();
                    if (item.reminders.get(r.key))
                        continue;
                    if (!shouldSend(dueDate, r.ms))
                        continue;
                    const { assignmentName } = parseName(item.name);
                    notificationsToSend.push({
                        title: 'Moodle Reminder',
                        body: `${assignmentName} is due on ${item.due}`,
                        tag: `moodle-${r.key}`,
                    });
                    for (const older of sortedReminders) {
                        if (older.ms >= r.ms) {
                            item.reminders.set(older.key, true);
                        }
                    }
                    break;
                }
            }
        }
        const vitol = user.notifications.sources.vitol;
        if (vitol?.enabled) {
            vitol.data = vitol.data.filter(item => !item.done);
            for (const item of vitol.data) {
                if (item.hidden)
                    continue;
                const opens = item.opens.split(',').map(e => e.trim());
                const opensTime = opens[opens.length - 1];
                const { hours, minutes } = parseTime12h(opensTime || "11:59 PM");
                const openDate = new Date(item.year, item.month - 1, item.day, hours, minutes, 0, 0);
                const sortedReminders = [...VITOL_REMINDERS].sort((a, b) => a.ms - b.ms);
                for (const r of sortedReminders) {
                    item.reminders ??= new Map();
                    if (item.reminders.get(r.key))
                        continue;
                    if (!shouldSend(openDate, r.ms))
                        continue;
                    const { courseName } = parseName(item.name);
                    notificationsToSend.push({
                        title: 'Vitol Reminder',
                        body: `${courseName} opens at ${item.opens}`,
                        tag: `vitol-${r.key}`,
                    });
                    for (const older of sortedReminders) {
                        if (older.ms >= r.ms) {
                            item.reminders.set(older.key, true);
                        }
                    }
                    break;
                }
            }
        }
        if (notificationsToSend.length > 0) {
            user.markModified('notifications.sources.moodle.data');
            user.markModified('notifications.sources.vitol.data');
            await user.save();
        }
        for (const sub of user.pushSubscriptions) {
            for (const n of notificationsToSend) {
                try {
                    await web_push_1.default.sendNotification(sub, JSON.stringify(n));
                }
                catch (err) {
                    console.error('❌ Push failed:', err?.statusCode, err?.body || err);
                    if (err?.statusCode === 410 || err?.statusCode === 404) {
                        await Users_1.default.updateOne({ _id: user._id }, { $pull: { pushSubscriptions: { endpoint: sub.endpoint } } });
                    }
                }
            }
        }
    }
}
function vitolReminder() {
    node_cron_1.default.schedule('0 * * * *', Reminder, {
        timezone: 'Asia/Kolkata',
    });
    Reminder().catch(console.error);
}
//# sourceMappingURL=VitolReminder.js.map