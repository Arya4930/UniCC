"use client";

import { X } from "lucide-react";
import { Button } from "../../ui/button";

export default function PrivacyPolicyPage({ handleClose }) {
    return (
        <div className="fixed inset-0 z-50 bg-gray-100 dark:bg-slate-900 midnight:bg-black bg-opacity-95 flex flex-col items-center justify-start overflow-y-auto p-6">
            <div className="w-full flex justify-between items-center mb-6 max-w-3xl">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 midnight:text-gray-100">
                    Privacy Policy
                </h2>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClose}
                    className="cursor-pointer hover:bg-gray-200 dark:hover:bg-slate-800 midnight:hover:bg-gray-900"
                >
                    <X size={22} className="text-gray-600 dark:text-gray-300 midnight:text-gray-200" />
                </Button>
            </div>

            <div className="w-full max-w-3xl space-y-4 text-gray-700 dark:text-gray-300 midnight:text-gray-200 text-sm leading-relaxed">
                <p>
                    This Privacy Policy describes how <strong>Uni CC</strong> handles data when you use the app.
                </p>

                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 midnight:text-gray-100 mt-4">
                    Data Storage
                </h3>
                <p>
                    All data fetched from <strong>VTOP</strong> (including your academic data, credentials, or
                    related content) is stored <strong>locally on your device</strong>. No information from VTOP is
                    ever uploaded, transmitted, or stored on any external servers controlled by this app.
                </p>

                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 midnight:text-gray-100 mt-4">
                    Cookies & Analytics
                </h3>
                <p>
                    <strong>Uni CC</strong> uses <strong>Vercel Analytics</strong> and <strong>Google Analytics</strong>
                    to gather <em>anonymous, aggregate data</em> such as page visits, device types, and general
                    interaction information. These analytics help improve the app’s performance and user experience.
                </p>
                <p>
                    This data does <strong>not</strong> include any personally identifiable information such as names,
                    login credentials, or academic records. The analytics cookies are handled entirely by
                    <strong> Google </strong> and <strong>Vercel</strong> under their respective privacy policies.
                </p>
                <p>
                    Uni CC does not track users, create profiles, sell data, or share analytics with any third party.
                    These analytics are used purely for <strong>educational and experimental</strong> purposes and can be
                    cleared anytime by removing browser cookies.
                </p>

                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 midnight:text-gray-100 mt-4">
                    Notifications
                </h3>
                <p>
                    The app does not send any push notifications or background alerts. There are no background
                    processes that track or monitor user behavior.
                </p>

                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 midnight:text-gray-100 mt-4">
                    Local Storage
                </h3>
                <p>
                    Settings, preferences, and any cached data are stored using your browser’s local storage
                    mechanism. This data never leaves your device and can be cleared manually at any time from
                    within the app.
                </p>

                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 midnight:text-gray-100 mt-4">
                    Open Source
                </h3>
                <p>
                    <strong>Uni CC</strong> is an <strong>open-source project</strong> created for learning and
                    experimentation purposes. The source code is publicly available, and anyone is welcome to
                    explore, modify, or contribute improvements through the project’s GitHub repository.
                </p>
                <p>
                    Contributions are voluntary and governed by the project’s open-source license. No data collected
                    by contributors or modifications affects user privacy or transmits information externally.
                </p>

                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 midnight:text-gray-100 mt-4">
                    Contact
                </h3>
                <p>
                    For any concerns or questions about this Privacy Policy, you can reach out to the developer at
                    <strong> aryapanwar493@gmail.com</strong>.
                </p>

                <p className="text-xs text-gray-500 dark:text-gray-400 midnight:text-gray-400 mt-6">
                    Last updated: 11 Nov, 2025
                </p>
            </div>
        </div>
    );
}
