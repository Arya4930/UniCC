"use client";

import React, { useEffect } from "react";
import ReelsScroller from "./ReelScroller";
import { X } from "lucide-react";

export function ReloadModal({ message, onClose, progressBar }) {
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "auto";
        };
    }, []);

    return (
        <div className="fixed inset-0 flex items-center justify-center z-60 backdrop-blur-sm bg-black/50">
            <div className="bg-white dark:bg-slate-900 midnight:bg-black rounded-3xl p-8 w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-700 midnight:border-gray-800">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 midnight:text-slate-100">
                        Reloading Data
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 midnight:hover:bg-gray-900 transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-600 dark:text-slate-300 midnight:text-slate-200" />
                    </button>
                </div>

                {message && (
                    <div className="flex flex-col items-center justify-center gap-4">
                        <ReelsScroller />
                        <div className="w-full bg-slate-200 dark:bg-slate-700 midnight:bg-gray-800 rounded-full h-2 overflow-hidden">
                            <div
                                className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-500 ease-out rounded-full"
                                style={{ width: `${progressBar}%` }}
                            ></div>
                        </div>
                        <span className="whitespace-pre-wrap text-center text-sm text-slate-700 dark:text-slate-300 midnight:text-slate-300">
                            {message}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
