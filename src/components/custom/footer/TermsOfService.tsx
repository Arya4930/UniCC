"use client";

import { X } from "lucide-react";
import { Button } from "../../ui/button";

export default function TermsOfServicePage({ handleClose }) {
    return (
        <div className="fixed inset-0 z-50 bg-gray-100 dark:bg-slate-900 midnight:bg-black bg-opacity-95 flex flex-col items-center justify-start overflow-y-auto p-6">
            <div className="w-full flex justify-between items-center mb-6 max-w-3xl">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 midnight:text-gray-100">
                    Terms of Service
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
                    Welcome to <strong>Uni CC</strong>. By using this application, you agree to the following Terms of Service.
                    Please read them carefully before using the app.
                </p>

                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 midnight:text-gray-100 mt-4">
                    Purpose
                </h3>
                <p>
                    <strong>Uni CC</strong> is an experimental web application created solely for educational and personal
                    use. It provides tools to help students view and organize their academic data retrieved from
                    <strong> VTOP</strong> (VIT’s official portal). This app is not an official VIT product and is
                    <strong> not affiliated, endorsed, or maintained by Vellore Institute of Technology (VIT)</strong>
                    in any manner.
                </p>

                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 midnight:text-gray-100 mt-4">
                    Data Handling
                </h3>
                <p>
                    The app does <strong>not collect, store, or transmit any personal information</strong> to any server.
                    All your login credentials, academic data, and settings remain
                    <strong> entirely on your local device</strong> via browser local storage.
                    Once you close or clear your browser data, all information is removed.
                </p>
                <p>
                    When you log in, the app connects directly to the official <strong>VTOP</strong> website to
                    retrieve your academic data for display. This data is processed locally in your browser and never
                    shared externally.
                </p>

                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 midnight:text-gray-100 mt-4">
                    No Monetization or Commercial Use
                </h3>
                <p>
                    <strong>Uni CC</strong> is a free and non-commercial project. The developer does not earn revenue,
                    display advertisements, sell data, or monetize the service in any way.
                    The app is provided purely for fun, learning, and experimentation purposes.
                </p>

                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 midnight:text-gray-100 mt-4">
                    Disclaimer of Liability
                </h3>
                <p>
                    The app is provided on an “as-is” basis with no guarantees of accuracy, reliability, or availability.
                    The developer is <strong>not responsible for any data inaccuracies, login failures, or service
                    interruptions</strong> that may occur due to VTOP updates or other external factors.
                </p>
                <p>
                    Users are solely responsible for the use of their VTOP credentials within the app. It is recommended
                    to use this app only on trusted devices and networks.
                </p>

                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 midnight:text-gray-100 mt-4">
                    Affiliation
                </h3>
                <p>
                    This app is an <strong>independent student project</strong> and is in no way affiliated with,
                    endorsed by, or supported by Vellore Institute of Technology (VIT) or any of its departments.
                </p>

                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 midnight:text-gray-100 mt-4">
                    Changes to Terms
                </h3>
                <p>
                    These terms may be updated periodically to reflect improvements or changes in app behavior.
                    Continued use of the app after updates constitutes acceptance of the revised terms.
                </p>

                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 midnight:text-gray-100 mt-4">
                    Contact
                </h3>
                <p>
                    For any concerns, questions, or feedback related to this app or these Terms of Service,
                    you can contact the developer at <strong>aryapanwar493@gmail.com</strong>.
                </p>

                <p className="text-xs text-gray-500 dark:text-gray-400 midnight:text-gray-400 mt-6">
                    Last updated: {new Date().toLocaleDateString()}
                </p>
            </div>
        </div>
    );
}
