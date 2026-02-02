import cron from 'node-cron'
import webpush from 'web-push'
import pLimit from 'p-limit'
import User from './models/Users'

const limit = pLimit(20)

async function Reminder() {
    console.log('🔔 Running push reminder cron job')

    const users = await User.find({ pushSubscriptions: { $ne: [] } })

    const payload = JSON.stringify({
        title: 'Reminder',
        body: 'This is a test reminder notification',
    })

    const tasks: Promise<void>[] = []

    for (const user of users) {
        for (const sub of user.pushSubscriptions) {
            tasks.push(
                limit(async () => {
                    try {
                        await webpush.sendNotification(sub, payload)
                    } catch (err: any) {
                        console.error('Push failed:', err.statusCode)

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

    console.log('✅ Push reminder cron finished')
}

export function vitolReminder() {
    cron.schedule('0 * * * *', Reminder)
}
