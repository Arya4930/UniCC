"use client";

import { X, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";

function LocalStorageItem({ storageKey, value, onDelete }) {
    const [showValue, setShowValue] = useState(
        storageKey !== "username" && storageKey !== "password"
    );
    const [expanded, setExpanded] = useState(false);

    let parsedValue = value;
    try {
        parsedValue = JSON.stringify(JSON.parse(value), null, 2);
    } catch (e) { }

    const isLarge = parsedValue.length > 400;
    const displayValue = isLarge && !expanded
        ? parsedValue.slice(0, 100) + "..."
        : parsedValue;

    return (
        <div className="flex flex-col bg-white dark:bg-slate-800 midnight:bg-black p-3 rounded-lg shadow border border-gray-300 dark:border-gray-700 midnight:border-gray-800">
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <p className="font-medium text-gray-800 dark:text-gray-200 midnight:text-gray-100 break-all">
                        {storageKey}
                    </p>
                    <pre
                        className={`text-sm text-gray-600 dark:text-gray-400 midnight:text-gray-300 break-all mt-1 whitespace-pre-wrap font-mono transition-all duration-300 ease-in-out ${!showValue ? "blur-sm select-none" : ""
                            }`}
                        onClick={() => setShowValue(true)}
                    >
                        {displayValue}
                    </pre>
                    {isLarge && (
                        <button
                            className="mt-2 hover:cursor-pointer flex items-center gap-1 text-blue-600 dark:text-blue-400 text-xs font-medium hover:underline"
                            onClick={() => setExpanded(!expanded)}
                        >
                            {expanded ? (
                                <>
                                    Show Less <ChevronUp size={14} />
                                </>
                            ) : (
                                <>
                                    Show More <ChevronDown size={14} />
                                </>
                            )}
                        </button>
                    )}
                </div>

                <button
                    onClick={onDelete}
                    className="ml-3 hover:cursor-pointer text-red-500 hover:text-red-700 dark:hover:text-red-400 midnight:hover:text-red-400 transition cursor-pointer"
                >
                    <X size={18} />
                </button>
            </div>
        </div>
    );
}

export default function DataPage({ handleClose, handleDeleteItem, storageData }) {
    return (
        <div className="fixed inset-0 z-50 bg-gray-100 dark:bg-slate-900 midnight:bg-black bg-opacity-95 flex flex-col items-center justify-start overflow-y-auto p-6">
            <div className="w-full flex justify-between items-center mb-6 max-w-3xl">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 midnight:text-gray-100">
                    LocalStorage Data
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

            <div className="w-full max-w-3xl space-y-3">
                {Object.keys(storageData).length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 midnight:text-gray-400 text-center">
                        No data found
                    </p>
                ) : (
                    Object.entries(storageData).map(([key, value]) => (
                        <LocalStorageItem
                            key={key}
                            storageKey={key}
                            value={value}
                            onDelete={() => handleDeleteItem(key)}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
