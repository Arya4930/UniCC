"use client";

import React, { useEffect } from "react";
import { RefreshCcw, X } from "lucide-react";

export function ReloadModal({ captchaImage, captcha, setCaptcha, handleLogin, message, onClose }) {
    const isLoading = message === "Logging in and fetching data...";
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "auto";
        };
    }, []);

    return (
        <div className={`fixed inset-0 flex items-center justify-center z-50 ${isLoading ? "backdrop-blur-sm" : "bg-black/50"}`}>
            <div className="bg-gray-700 rounded-xl p-6 w-full max-w-md text-white">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold">Reload Session</h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-gray-600 transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <p className="text-sm mb-4">Enter the new captcha to refresh your data.</p>

                <form onSubmit={handleLogin} className="space-y-4">
                    {captchaImage && !isLoading && (
                        <>
                            <img
                                src={captchaImage}
                                alt="Captcha"
                                className="w-full h-16 object-contain rounded-md"
                            />
                            <input
                                className="w-full border border-gray-400 bg-gray-800 text-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={captcha}
                                onChange={(e) => setCaptcha(e.target.value)}
                                placeholder="Enter New Captcha"
                            />
                            <button
                                type="submit"
                                className="w-full bg-blue-600 py-2 rounded-lg hover:bg-blue-700 transition"
                            >
                                Submit
                            </button>
                        </>
                    )}

                    {message && (
                        <div className="flex items-center gap-2 justify-center text-sm">
                            {isLoading && (
                                <RefreshCcw className="w-4 h-4 animate-spin" />
                            )}
                            <span>{message}</span>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
