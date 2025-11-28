"use client";

import { useState } from "react";
import { Copy, Check, ChevronDown, ChevronRight } from "lucide-react";

export default function Links() {
    const Links = [
        "https://uni-cc.site",
        "https://uni-cc.vercel.app",
        "https://uni-cc.netlify.app",
        "https://github.uni-cc.site"
    ];

    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const [open, setOpen] = useState(false);

    const handleCopy = (link: string, index: number) => {
        navigator.clipboard.writeText(link);
        setCopiedIndex(index);

        setTimeout(() => {
            setCopiedIndex(null);
        }, 1200);
    };

    return (
        <div className="w-full">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between text-left text-xl font-semibold text-gray-800 dark:text-gray-200 midnight:text-gray-100 hover:cursor-pointer"
            >
                <span>Links</span>
                {open ? (
                    <ChevronDown className="w-5 h-5" />
                ) : (
                    <ChevronRight className="w-5 h-5" />
                )}
            </button>

            <div
                className={`transition-all overflow-hidden ${open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    }`}
            >
                <div className="space-y-3 mt-2">
                    {Links.map((link, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between px-4 py-3 bg-gray-200 dark:bg-slate-800 midnight:bg-gray-900 rounded-lg"
                        >
                            <span
                                className="flex-1 text-gray-800 dark:text-gray-200 midnight:text-gray-100 truncate"
                                title={link}
                            >
                                {link}
                            </span>

                            <button
                                onClick={() => handleCopy(link, index)}
                                className="ml-3 p-2 rounded-md bg-gray-300 dark:bg-slate-700 midnight:bg-gray-800 hover:bg-gray-400 dark:hover:bg-slate-600 transition-colors"
                            >
                                {copiedIndex === index ? (
                                    <Check className="w-4 h-4 text-green-500 scale-110 transition-transform duration-300" />
                                ) : (
                                    <Copy className="w-4 h-4 text-gray-700 dark:text-gray-200 midnight:text-gray-300" />
                                )}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
