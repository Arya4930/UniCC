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

function shouldSend(target: Date, offset: number) {
    const now = Date.now()
    const trigger = target.getTime() - offset
    return now >= trigger && now < trigger + ONE_HOUR
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

    const tasks: Promise<void>[] = []

    for (const user of users) {
        for (const sub of user.pushSubscriptions) {
            tasks.push(
                limit(async () => {
                    try {
                        let dirty = false
                        const moodle = user.notifications.sources.moodle
                        const moodleLines: string[] = []

                        if (moodle?.enabled) {
                            const before = moodle.data.length

                            moodle.data = moodle.data.filter(item => !item.done)

                            if (moodle.data.length !== before) dirty = true

                            for (const item of moodle.data) {
                                if (item.done || item.hidden) continue

                                const dueDate = new Date(item.year, item.month - 1, item.day)

                                for (const r of MOODLE_REMINDERS) {
                                    item.reminders ??= {}
                                    if (item.reminders[r.key]) continue

                                    if (shouldSend(dueDate, r.ms)) {
                                        const { assignmentName } = parseName(item.name)

                                        moodleLines.push(
                                            `${assignmentName} is due on ${item.due}`
                                        )

                                        item.reminders[r.key] = true
                                        dirty = true
                                    }
                                }
                            }

                            if (moodleLines.length > 0) {
                                await webpush.sendNotification(
                                    sub,
                                    JSON.stringify({
                                        title: 'Moodle Reminders',
                                        body: moodleLines.join('\n'),
                                    })
                                )
                            }
                        }

                        const vitol = user.notifications.sources.vitol
                        const vitolLines: string[] = []

                        if (vitol?.enabled) {
                            const before = vitol.data.length

                            vitol.data = vitol.data.filter(item => !item.done)

                            if (vitol.data.length !== before) dirty = true
                            
                            for (const item of vitol.data) {
                                if (item.done || item.hidden) continue

                                const openDate = new Date(item.opens)

                                for (const r of VITOL_REMINDERS) {
                                    item.reminders ??= {}
                                    if (item.reminders[r.key]) continue

                                    if (shouldSend(openDate, r.ms)) {
                                        const { courseName } = parseName(item.name)

                                        vitolLines.push(
                                            `${courseName} opens at ${item.opens}`
                                        )

                                        item.reminders[r.key] = true
                                        dirty = true
                                    }
                                }
                            }

                            if (vitolLines.length > 0) {
                                await webpush.sendNotification(
                                    sub,
                                    JSON.stringify({
                                        title: 'Vitol Reminders',
                                        body: vitolLines.join('\n'),
                                    })
                                )
                            }
                        }

                        if (dirty) await user.save()

                    } catch (err: any) {
                        console.error('❌ Push failed:', err.statusCode)

                        if (err.statusCode === 410 || err.statusCode === 404) {
                            await User.updateOne(
                                { UserID: user.UserID },
                                { $pull: { pushSubscriptions: { endpoint: sub.endpoint } } }
                            )
                        }
                    }
                })
            )
        }
    }

    await Promise.all(tasks)
}

export function vitolReminder() {
    cron.schedule('0 * * * *', Reminder)
}
