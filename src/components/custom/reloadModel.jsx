"use client"

import React, { useState } from 'react';
import { RefreshCcw, X, ChevronDown, ChevronUp } from 'lucide-react'

export function ReloadModal({ captchaImage, captcha, setCaptcha, handleLogin, message, onClose }) {
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-gray-600 rounded-xl shadow-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold">Reload Session</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-500 transition hover:cursor-pointer">
                        <X className="w-5 h-5 text-white" />
                    </button>
                </div>
                <p className="text-sm text-white mb-4">
                    Enter the new captcha to refresh your data.
                </p>
                <form onSubmit={handleLogin} className="space-y-4">
                    {captchaImage && (
                        <>
                            <img
                                src={captchaImage}
                                alt="Captcha"
                                className="w-full h-16 object-contain"
                            />
                            <input
                                className="w-full border p-2 rounded-lg"
                                value={captcha}
                                onChange={(e) => setCaptcha(e.target.value)}
                                placeholder="Enter New Captcha"
                            />
                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                            >
                                Submit
                            </button>
                        </>
                    )}
                    {message && <p className="text-sm">{message}</p>}
                </form>
            </div>
        </div>
    );
}