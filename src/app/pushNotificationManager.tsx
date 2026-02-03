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
    const [vitolEnabled, setVitolEnabled] = useState(false)
    const [moodleEnabled, setMoodleEnabled] = useState(false)
    const [fetchError, setFetchError] = useState<string | null>(null)

    const UserID = localStorage.getItem("username") || ""

    useEffect(() => {
        if (!UserID) return;

        fetch(`${API_BASE}/api/notifications/status?UserID=${UserID}`)
            .then(res => res.json())
            .then(data => {
                setVitolEnabled(!!data.vitol);
                setMoodleEnabled(!!data.moodle);
            })
            .catch(() => {
                setVitolEnabled(false);
                setMoodleEnabled(false);
            });
    }, [UserID]);

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

    if (!isSupported) {
        return <p>Push notifications are not supported in this browser.</p>
    }

    async function updateSource(source: 'vitol' | 'moodle', enabled: boolean) {
        const data =
            enabled
                ? JSON.parse(localStorage.getItem(`${source}Data`) || '[]')
                : [];

        await fetch(`${API_BASE}/api/notifications/config`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                UserID,
                source,
                enabled,
                data,
            }),
        });
    }

    return (
        <div className="w-full flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <div className="flex flex-col">
                    <p className="text-lg font-semibold text-gray-800 dark:text-gray-200 midnight:text-gray-100">
                        Push Notifications
                    </p>
                </div>

                <Switch
                    checked={!!subscription}
                    onCheckedChange={(checked) => {
                        checked ? subscribeToPush() : unsubscribeFromPush()
                    }}
                />
            </div>

            {subscription && (
                <div className="mt-1 flex flex-col gap-4">

                    {/* Vitol */}
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 midnight:text-gray-100">
                                    Vitol notifications
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Tests, quizzes and assignments <span className='text-xs text-red-600'>{fetchError ? " / " + fetchError : ''}</span>
                                </p>
                            </div>

                            <Switch
                                checked={vitolEnabled}
                                disabled={!subscription}
                                onCheckedChange={(checked) => {
                                    setVitolEnabled(checked)
                                    updateSource('vitol', checked)
                                }}
                            />
                        </div>

                        <button
                            disabled={!vitolEnabled}
                            className="w-fit text-xs text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50 disabled:pointer-events-none"
                            onClick={async () => {
                                try {
                                    const response = await fetch(`${API_BASE}/api/notifications/test`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ UserID, source: 'vitol' }),
                                    });
                                    if (!response.ok) {
                                        const errorData = await response.json();
                                        setFetchError(errorData.error || 'Failed to send test notification');
                                    } else {
                                        setFetchError(null);
                                    }
                                } catch (error) {
                                    setFetchError('Failed to send test notification');
                                }
                            }}
                        >
                            Test Vitol notification
                        </button>
                    </div>

                    {/* Moodle */}
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 midnight:text-gray-100">
                                    Moodle notifications
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Assignment due reminders <span className='text-xs text-red-600'>{fetchError ? " / " + fetchError : ''}</span>
                                </p>
                            </div>

                            <Switch
                                checked={moodleEnabled}
                                disabled={!subscription}
                                onCheckedChange={(checked) => {
                                    setMoodleEnabled(checked)
                                    updateSource('moodle', checked)
                                }}
                            />
                        </div>

                        <button
                            disabled={!moodleEnabled}
                            className="w-fit text-xs text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50 disabled:pointer-events-none"
                            onClick={async () => {
                                try {
                                    const response = await fetch(`${API_BASE}/api/notifications/test`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ UserID, source: 'moodle' }),
                                    });
                                    if (!response.ok) {
                                        const errorData = await response.json();
                                        setFetchError(errorData.error || 'Failed to send test notification');
                                    } else {
                                        setFetchError(null);
                                    }
                                } catch (error) {
                                    setFetchError('Failed to send test notification');
                                }
                            }}
                        >
                            Test Moodle notification
                        </button>
                    </div>

                </div>
            )
            }
        </div >
    )
}
