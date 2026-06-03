"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Clock } from "lucide-react"
import { CircularProgressbar, buildStyles } from "react-circular-progressbar"
import "react-circular-progressbar/dist/styles.css"
import { useState, useEffect } from "react"

export default function CourseCard({ a, onClick, activeDay, isHoliday, decimalValues, isDayscholarWithBus }) {
    const [ongoing, setOngoing] = useState(false);
    const lab = a.slotName.split('')[0] === "L";

    const isOngoing = () => {
        if (!a.time || !activeDay) return false;

        const today = new Date().toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
        if (!today.startsWith(activeDay.slice(0, 3).toUpperCase())) return false;

        const [startStr, endStr] = a.time.split("-").map(t => t.trim());
        if (!startStr || !endStr) return false;

        const parseTime = (str) => {
            const [hour, minute] = str.split(":").map(Number);
            const d = new Date();
            let h = hour;
            let m = minute || 0;
            if (h < 8) h += 12;
            d.setHours(h, m, 0, 0);
            return d;
        };

        const start = parseTime(startStr);
        const end = parseTime(endStr);
        const now = new Date();

        return now >= start && now <= end;
    };

    useEffect(() => {
        setOngoing(isOngoing());
    }, [a.time, activeDay]);

    return (
        <Card
            onClick={onClick}
            className={`p-4 rounded-lg shadow-sm transition-shadow duration-300 cursor-pointer h-full flex flex-col justify-between
                ${(ongoing && !isHoliday)
                    ? "ring-2 ring-yellow-200 shadow-lg bg-yellow-50 dark:bg-yellow-900/40 midnight:bg-yellow-900/40"
                    : "hover:shadow-md dark:hover:shadow-lg midnight:hover:shadow-lg"
                }`}
        >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full relative">
                {/* Mobile View: Same old layout but slightly improved */}
                <div className="md:hidden flex justify-between items-start w-full">
                    <div className="flex flex-col gap-2 flex-grow pr-4">
                        <CardHeader className="p-0">
                            <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-100 midnight:text-gray-100">
                                {a.courseTitle}
                            </CardTitle>
                            <p className="text-sm font-medium text-blue-600 dark:text-blue-400 midnight:text-blue-400">
                                {a.slotName}
                            </p>
                        </CardHeader>

                        <CardContent className="p-0 text-sm text-gray-600 dark:text-gray-300 midnight:text-gray-300 space-y-1">
                            <div className="flex items-center gap-2">
                                <Building2 size={16} className="text-gray-500 dark:text-gray-400 midnight:text-gray-400" />
                                <span>{a.slotVenue}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock size={16} className="text-gray-500 dark:text-gray-400 midnight:text-gray-400" />
                                <span>{a.time}</span>
                            </div>
                            <p className="truncate max-w-[200px]">
                                <strong>Faculty:</strong> {a.faculty}
                            </p>
                            <p>
                                <strong>Classes Attended:</strong>{" "}
                                <span className="font-semibold">
                                    {a.attendedClasses}/{a.totalClasses}
                                </span>
                            </p>
                        </CardContent>
                        {a.totalClasses > 0 && (() => {
                            const attended = a.attendedClasses;
                            const total = a.totalClasses;
                            const percentage = (attended / total) * 100;
                            const threshold = isDayscholarWithBus ? 0.85 : 0.75;
                            const thresholdPct = isDayscholarWithBus ? 85 : 75;

                            if (percentage < thresholdPct) {
                                const needed = Math.ceil((threshold * total - attended) / (1 - threshold));
                                const neededValue = lab ? Math.ceil(needed / 2) : needed;
                                return (
                                    <p className="text-red-500 dark:text-red-400 midnight:text-red-400 text-sm font-medium">
                                        Need <strong>{neededValue}</strong> {lab ? "lab" : "class"}{neededValue > 1 && (lab ? "s" : "es")} for {thresholdPct}%
                                    </p>
                                );
                            } else {
                                const canMiss = Math.floor(attended / threshold - total);
                                const canMissValue = lab ? Math.floor(canMiss / 2) : canMiss;
                                if (canMissValue === 0) {
                                    return (
                                        <p className="text-yellow-500 dark:text-yellow-400 midnight:text-yellow-400 text-sm font-medium">
                                            Attend next {lab ? "lab" : "class"}!
                                        </p>
                                    );
                                } else {
                                    return (
                                        <p className="text-green-500 dark:text-green-400 midnight:text-green-400 text-sm font-medium">
                                            Can miss <strong>{canMissValue}</strong> {lab ? "lab" : "class"}{canMissValue !== 1 && (lab ? "s" : "es")}
                                        </p>
                                    );
                                }
                            }
                        })()}
                    </div>
                    <div className="w-24 h-24 flex-shrink-0 flex flex-col items-center justify-center">
                        <CircularProgressbar
                            value={a.attendancePercentage}
                            text={`${!decimalValues ? a.attendancePercentage : (a.attendedClasses/a.totalClasses * 100).toFixed(1)}%`}
                            styles={buildStyles({
                                pathColor: a.attendancePercentage < (isDayscholarWithBus ? 85 : 75) ? "#EF4444" : a.attendancePercentage < (isDayscholarWithBus ? 90 : 85) ? "#FACC15" : "#2df04aff",
                                textColor: "currentColor", trailColor: "#CBD5E1", strokeLinecap: "round", pathTransitionDuration: 0.5,
                            })}
                        />
                        <p className="text-center text-xs font-semibold mt-1 text-gray-700 dark:text-gray-300 midnight:text-gray-300">
                            Attendance
                        </p>
                    </div>
                </div>

                {/* Desktop View: Row Layout */}
                <div className="hidden md:flex w-full items-center justify-between gap-6 py-2">
                    <div className="flex-1 min-w-0 pr-4 border-r border-gray-200 dark:border-gray-700 midnight:border-gray-800">
                        <CardHeader className="p-0">
                            <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-100 midnight:text-gray-100 truncate">
                                {a.courseTitle}
                            </CardTitle>
                            <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 midnight:text-blue-400 mt-1">
                                {a.slotName}
                            </p>
                        </CardHeader>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 truncate max-w-full">
                            {a.faculty}
                        </p>
                    </div>

                    <div className="flex-1 min-w-0 px-4 border-r border-gray-200 dark:border-gray-700 midnight:border-gray-800 space-y-2">
                        <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                            <Building2 size={18} className="text-gray-400" />
                            <span className="font-medium">{a.slotVenue}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                            <Clock size={18} className="text-gray-400" />
                            <span className="font-medium">{a.time}</span>
                        </div>
                    </div>

                    <div className="flex-1 min-w-0 px-4 border-r border-gray-200 dark:border-gray-700 midnight:border-gray-800 flex flex-col justify-center">
                        <div className="mb-2">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Classes Attended:</span>
                            <div className="text-lg font-bold text-gray-900 dark:text-gray-100 midnight:text-gray-100">{a.attendedClasses} <span className="text-sm text-gray-400 font-normal">/ {a.totalClasses}</span></div>
                        </div>
                        {a.totalClasses > 0 && (() => {
                            const attended = a.attendedClasses;
                            const total = a.totalClasses;
                            const percentage = (attended / total) * 100;
                            const threshold = isDayscholarWithBus ? 0.85 : 0.75;
                            const thresholdPct = isDayscholarWithBus ? 85 : 75;

                            if (percentage < thresholdPct) {
                                const needed = Math.ceil((threshold * total - attended) / (1 - threshold));
                                const neededValue = lab ? Math.ceil(needed / 2) : needed;
                                return (
                                    <p className="text-red-500 dark:text-red-400 midnight:text-red-400 text-sm font-medium bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded w-fit">
                                        Need <strong>{neededValue}</strong> {lab ? "lab" : "class"}{neededValue > 1 && (lab ? "s" : "es")}
                                    </p>
                                );
                            } else {
                                const canMiss = Math.floor(attended / threshold - total);
                                const canMissValue = lab ? Math.floor(canMiss / 2) : canMiss;
                                if (canMissValue === 0) {
                                    return (
                                        <p className="text-yellow-600 dark:text-yellow-400 midnight:text-yellow-400 text-sm font-medium bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded w-fit">
                                            Edge! Attend next
                                        </p>
                                    );
                                } else {
                                    return (
                                        <p className="text-green-600 dark:text-green-400 midnight:text-green-400 text-sm font-medium bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded w-fit">
                                            Safe to miss <strong>{canMissValue}</strong>
                                        </p>
                                    );
                                }
                            }
                        })()}
                    </div>

                    <div className="w-20 h-20 flex-shrink-0 flex flex-col items-center justify-center pl-2">
                        <CircularProgressbar
                            value={a.attendancePercentage}
                            text={`${!decimalValues ? a.attendancePercentage : (a.attendedClasses/a.totalClasses * 100).toFixed(1)}%`}
                            styles={buildStyles({
                                pathColor: a.attendancePercentage < (isDayscholarWithBus ? 85 : 75) ? "#EF4444" : a.attendancePercentage < (isDayscholarWithBus ? 90 : 85) ? "#FACC15" : "#2df04aff",
                                textColor: "currentColor", trailColor: "#CBD5E1", strokeLinecap: "round", pathTransitionDuration: 0.5,
                            })}
                        />
                    </div>
                </div>
            </div>
        </Card>
    );
}
