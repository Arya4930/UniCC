'use client'

import { useState, useEffect } from 'react'
import { Switch } from "@/components/ui/switch"
import { API_BASE } from '@/components/custom/Main'

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = window.atob(base64)
    return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)))
}

export default function PushNotificationManager() {
    const [isSupported, setIsSupported] = useState(false)
    const [subscription, setSubscription] = useState<PushSubscription | null>(null)

    const UserID = localStorage.getItem("username") || ""
    const message = 'This is a test push notification.'

    useEffect(() => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            setIsSupported(true)
            registerServiceWorker()
        }
    }, [])

    async function registerServiceWorker() {
        const registration = await navigator.serviceWorker.register('/sw.js')
        const sub = await registration.pushManager.getSubscription()
        setSubscription(sub)
    }

    async function subscribeToPush() {
        const permission = await Notification.requestPermission()
        if (permission !== 'granted') return

        const registration = await navigator.serviceWorker.ready
        const sub = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(
                process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
            ),
        })

        setSubscription(sub)

        await fetch(`${API_BASE}/api/notifications/subscribe`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                UserID,
                subscription: JSON.parse(JSON.stringify(sub)),
            }),
        })
    }

    async function unsubscribeFromPush() {
        if (!subscription) return

        await subscription.unsubscribe()

        await fetch(`${API_BASE}/api/notifications/unsubscribe`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                UserID,
                endpoint: subscription.endpoint,
            }),
        })

        setSubscription(null)
    }

    async function sendTestNotification() {
        await fetch(`${API_BASE}/api/notifications/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                UserID,
                message,
            }),
        })
    }

    if (!isSupported) {
        return <p>Push notifications are not supported in this browser.</p>
    }

    return (
        <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
                <p className="font-medium">Notifications ( VERY EARLY TESTING, THIS DOESNT WORK, DONT CLICK XOXO )</p>
                <p className="text text-muted-foreground">
                    {subscription
                        ? 'Push Notifications Enabled'
                        : 'Push Notifications Disabled'}
                </p>

                {subscription && (
                    <button
                        onClick={sendTestNotification}
                        className="mt-2 w-fit rounded-md bg-primary px-3 py-1 text-xs text-primary-foreground hover:bg-primary/90"
                    >
                        Send test notification
                    </button>
                )}
            </div>

            <Switch
                checked={!!subscription}
                onCheckedChange={(checked) => {
                    checked ? subscribeToPush() : unsubscribeFromPush()
                }}
            />
        </div>
    )
}
