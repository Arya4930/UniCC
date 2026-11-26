"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Plus, Trash2, AlertCircle, Info } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import type { settings } from "@/components/custom/Main";

const DEFAULT_TIMES = ["11:59", "18:00"];

export default function AutoReload({settings}: {settings?: settings}) {
    const [isOn, setIsOn] = useState<boolean>(false);
    const [times, setTimes] = useState<string[]>(DEFAULT_TIMES);
    const [lastReloadTime, setLastReloadTime] = useState<string | null>(null);
    const [newTime, setNewTime] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [isLoaded, setIsLoaded] = useState<boolean>(false);

    // Load initial config from localStorage "settings" or prop
    useEffect(() => {
        try {
            const stored = localStorage.getItem("settings");
            const parsedSettings: settings | null = stored ? JSON.parse(stored) : null;
            const autoReloadConfig = parsedSettings?.autoReload ?? settings?.autoReload;

            if (autoReloadConfig) {
                setIsOn(Boolean(autoReloadConfig.isOn));
                setLastReloadTime(autoReloadConfig.lastReloadTime ?? null);
                if (Array.isArray(autoReloadConfig.times)) {
                    // Sort times chronologically
                    const sorted = [...autoReloadConfig.times].sort((a, b) => a.localeCompare(b));
                    setTimes(sorted);
                } else {
                    setTimes(DEFAULT_TIMES);
                }
            } else {
                setTimes(DEFAULT_TIMES);
                setLastReloadTime(null);
            }
        } catch (err) {
            console.error("Failed to load autoReload settings from localStorage:", err);
            setTimes(DEFAULT_TIMES);
            setLastReloadTime(null);
        } finally {
            setIsLoaded(true);
        }
    }, [settings]);

    // Persist configuration directly into "settings" in localStorage
    const persistConfig = (
        updatedIsOn: boolean,
        updatedTimes: string[],
        updatedLastReloadTime: string | null = lastReloadTime
    ) => {
        try {
            const stored = localStorage.getItem("settings");
            const currentSettings: Partial<settings> = stored ? JSON.parse(stored) : (settings || {});

            const updatedSettings: settings = {
                ...currentSettings,
                autoReload: {
                    isOn: updatedIsOn,
                    times: updatedTimes,
                    lastReloadTime: updatedLastReloadTime,
                },
            } as settings;

            localStorage.setItem("settings", JSON.stringify(updatedSettings));
        } catch (err) {
            console.error("Failed to save settings to localStorage:", err);
        }
    };

    const handleToggle = (checked: boolean) => {
        setIsOn(checked);
        setError(null);
        persistConfig(checked, times, lastReloadTime);
    };

    const handleAddTime = () => {
        setError(null);

        if (!newTime) {
            setError("Please select a time first.");
            return;
        }

        if (times.includes(newTime)) {
            setError("This time is already in your schedule.");
            return;
        }

        const updatedTimes = [...times, newTime].sort((a, b) => a.localeCompare(b));
        setTimes(updatedTimes);
        setNewTime("");
        persistConfig(isOn, updatedTimes, lastReloadTime);
    };

    const handleRemoveTime = (timeToRemove: string) => {
        const updatedTimes = times.filter((t) => t !== timeToRemove);
        setTimes(updatedTimes);
        persistConfig(isOn, updatedTimes, lastReloadTime);
    };

    // Format 24-hour "HH:mm" time to 12-hour format with AM/PM
    const formatTime12Hour = (timeStr: string) => {
        const [h, m] = timeStr.split(":").map(Number);
        if (isNaN(h) || isNaN(m)) return timeStr;
        const period = h >= 12 ? "PM" : "AM";
        const formattedHour = h % 12 || 12;
        const formattedMinutes = m.toString().padStart(2, "0");
        return `${formattedHour}:${formattedMinutes} ${period}`;
    };

    const formatLastReloadTime = (timeStr: string | null) => {
        if (!timeStr) return "";
        try {
            const date = new Date(timeStr);
            if (isNaN(date.getTime())) return timeStr;
            return date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
            }) + " at " + date.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
            });
        } catch {
            return timeStr;
        }
    };

    return (
        <div className="w-full flex flex-col gap-2">
            {/* Header with Switch */}
            <div className="flex items-center justify-between">
                <div className="flex flex-col">
                    <p className="text-lg font-semibold text-gray-800 dark:text-gray-200 midnight:text-gray-100">
                        AutoReload
                    </p>
                    {lastReloadTime && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 midnight:text-gray-400">
                            Last reloaded: {formatLastReloadTime(lastReloadTime)}
                        </p>
                    )}
                </div>

                <Switch
                    checked={isOn}
                    onCheckedChange={handleToggle}
                    disabled={!isLoaded}
                />
            </div>

            {/* Expandable Options when AutoReload is enabled */}
            <AnimatePresence initial={false}>
                {isOn && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="flex flex-col gap-4">
                            {/* Explanatory Note */}
                            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-blue-50/70 dark:bg-blue-950/30 midnight:bg-blue-950/20 border border-blue-200/70 dark:border-blue-900/50 midnight:border-blue-900/40 text-blue-900 dark:text-blue-200 midnight:text-blue-100 text-xs leading-relaxed">
                                <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                                <p>
                                    As soon as you open the app, if the time the app last reloaded was before any of the scheduled times below, the app will automatically reload your data (provided there is a stable internet connection). Max of 3 Distinct Times recommended
                                </p>
                            </div>

                            {/* Time Input Section */}
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    <input
                                        id="autoreload-time-input"
                                        type="time"
                                        value={newTime}
                                        onChange={(e) => {
                                            setNewTime(e.target.value);
                                            if (error) setError(null);
                                        }}
                                        className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 midnight:border-gray-800 bg-white dark:bg-slate-800 midnight:bg-black text-gray-800 dark:text-gray-200 midnight:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 [color-scheme:light] dark:[color-scheme:dark] midnight:[color-scheme:dark]"
                                    />

                                    <motion.button
                                        type="button"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleAddTime}
                                        className="cursor-pointer px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-xs"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add Time
                                    </motion.button>
                                </div>

                                {/* Error message */}
                                <AnimatePresence>
                                    {error && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -4 }}
                                            className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1 mt-1"
                                        >
                                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                            {error}
                                        </motion.p>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Scheduled Times List */}
                            <div className="flex flex-col gap-2">
                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 midnight:text-gray-400">
                                    Scheduled Times ({times.length})
                                </p>

                                {times.length === 0 ? (
                                    <div className="p-3 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 midnight:border-gray-800 text-center">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            No reload times added yet. Pick a time above and click &quot;Add Time&quot;.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                        <AnimatePresence>
                                            {times.map((time) => (
                                                <motion.div
                                                    key={time}
                                                    layout
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.9 }}
                                                    transition={{ duration: 0.18 }}
                                                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-200/70 dark:bg-slate-800 midnight:bg-gray-900 border border-gray-300/50 dark:border-gray-700/60 midnight:border-gray-800"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="w-4 h-4 text-blue-500 shrink-0" />
                                                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 midnight:text-gray-100">
                                                            {formatTime12Hour(time)}
                                                        </span>
                                                    </div>

                                                    <motion.button
                                                        type="button"
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => handleRemoveTime(time)}
                                                        aria-label={`Remove time ${time}`}
                                                        className="cursor-pointer p-1 rounded-md text-gray-400 hover:text-red-500 hover:bg-gray-300/60 dark:hover:bg-slate-700 midnight:hover:bg-gray-800 transition-colors"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </motion.button>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
