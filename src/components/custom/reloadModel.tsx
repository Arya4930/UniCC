"use client";

import { useEffect } from "react";
// import ReelsScroller from "./ReelScroller";
import { X } from "lucide-react";

export function ReloadModal({ message, onClose, progressBar }) {
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "auto";
        };
    }, []);

    return (
        <div className="fixed inset-0 flex items-center justify-center z-60 backdrop-blur-sm">
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
                    <div className="flex flex-col items-center justify-center gap-3 text-sm">
                        {/* <ReelsScroller /> */}
                        <div className="w-36 bg-gray-600/50 rounded-full h-2 overflow-hidden">
                            <div
                                className="h-2 bg-blue-500 transition-all duration-500 ease-in-out"
                                style={{ width: `${progressBar}%` }}
                            ></div>
                        </div>
                        <span className="whitespace-pre-wrap">{message}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
