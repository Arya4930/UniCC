"use client";

import React, { useEffect } from "react";
import { RefreshCcw, X } from "lucide-react";

export function ReloadModal({ message, onClose }) {
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "auto";
        };
    }, []);

    return (
        <div className={`fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm`}>
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
                {message && (
                    <div className="flex items-center gap-2 justify-center text-sm">
                       <RefreshCcw className="w-4 h-4 animate-[spin_1s_linear_infinite] [animation-direction:reverse]" />
                        <span>{message}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
