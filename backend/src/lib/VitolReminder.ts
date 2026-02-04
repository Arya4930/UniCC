import cron from 'node-cron'
import webpush from 'web-push'
import pLimit from 'p-limit'
import User from './models/Users'

const limit = pLimit(20)
const ONE_HOUR = 60 * 60 * 1000

const MOODLE_REMINDERS = [
    { key: '3d', ms: 3 * 24 * ONE_HOUR },
    { key: '1d', ms: 24 * ONE_HOUR },
    { key: '12h', ms: 12 * ONE_HOUR },
    { key: '6h', ms: 6 * ONE_HOUR },
    { key: '3h', ms: 3 * ONE_HOUR },
    { key: '1h', ms: ONE_HOUR },
]

const VITOL_REMINDERS = [
    { key: '6h', ms: 6 * ONE_HOUR },
    { key: '2h', ms: 2 * ONE_HOUR },
    { key: '30m', ms: 30 * 60 * 1000 },
]

function parseTime12h(time: string): { hours: number; minutes: number } {
  const [clock, modifier] = time.split(' ')
  let [hours, minutes] = clock?.split(':').map(Number) || [0, 0]

  if(!hours) hours = 0;
  if(!minutes) minutes = 0;

  if (modifier === 'PM' && hours !== 12) hours += 12
  if (modifier === 'AM' && hours === 12) hours = 0

  return { hours, minutes }
}

function shouldSend(target: Date, offset: number) {
    const now = Date.now()
    const trigger = target.getTime() - offset
    return now >= trigger
}

function parseName(name: string) {
    const [, courseName, assignmentName] = name.split("/")
    return {
        courseName: courseName || "Course",
        assignmentName: assignmentName || name,
    }
}

async function Reminder() {
    console.log('🔔 Running reminder cron')

    const users = await User.find({
        'notifications.enabled': true,
        pushSubscriptions: { $ne: [] },
    })

    for (const user of users) {
        const notificationsToSend: {
            title: string
            body: string
            tag: string
        }[] = []

        const moodle = user.notifications.sources.moodle
        if (moodle?.enabled) {
            moodle.data = moodle.data.filter(item => !item.done)

            for (const item of moodle.data) {
                if (item.hidden) continue
                const due = item.due.split(',').map(e => e.trim())
                const dueTime = due[due.length - 1];
                const { hours, minutes } = parseTime12h(dueTime || "11:59 PM")
                const dueDate = new Date(item.year, item.month - 1, item.day, hours, minutes, 0, 0)

                for (const r of MOODLE_REMINDERS) {
                    item.reminders ??= new Map<string, boolean>()
                    if (item.reminders.get(r.key)) continue
                    if (!shouldSend(dueDate, r.ms)) continue
                    
                    const { assignmentName } = parseName(item.name)

                    notificationsToSend.push({
                        title: 'Moodle Reminder',
                        body: `${assignmentName} is due on ${item.due}`,
                        tag: `moodle-${r.key}`,
                    })

                    item.reminders.set(r.key, true)
                }
            }
        }

        const vitol = user.notifications.sources.vitol
        if (vitol?.enabled) {
            vitol.data = vitol.data.filter(item => !item.done)

            for (const item of vitol.data) {
                if (item.hidden) continue

                const openDate = new Date(item.opens)

                for (const r of VITOL_REMINDERS) {
                    item.reminders ??= new Map<string, boolean>()
                    if (item.reminders.get(r.key)) continue
                    if (!shouldSend(openDate, r.ms)) continue

                    const { courseName } = parseName(item.name)

                    notificationsToSend.push({
                        title: 'Vitol Reminder',
                        body: `${courseName} opens at ${item.opens}`,
                        tag: `vitol-${r.key}`,
                    })

                    item.reminders.set(r.key, true)
                }
            }
        }

        if (notificationsToSend.length > 0) {
            user.markModified('notifications.sources.moodle.data')
            user.markModified('notifications.sources.vitol.data')
            await user.save()
        }

        for (const sub of user.pushSubscriptions) {
            for (const n of notificationsToSend) {
                try {
                    await webpush.sendNotification(sub, JSON.stringify(n))
                } catch (err: any) {
                    console.error('❌ Push failed:', err?.statusCode, err?.body || err)

                    if (err?.statusCode === 410 || err?.statusCode === 404) {
                        await User.updateOne(
                            { _id: user._id },
                            { $pull: { pushSubscriptions: { endpoint: sub.endpoint } } }
                        )
                    }
                }
            }
        }
    }
}

export function vitolReminder() {
    cron.schedule('0 * * * *', Reminder)
    Reminder().catch(console.error)
}
