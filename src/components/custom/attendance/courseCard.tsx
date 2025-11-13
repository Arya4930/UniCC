"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Clock, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react"
import { CircularProgressbar, buildStyles } from "react-circular-progressbar"
import "react-circular-progressbar/dist/styles.css"
import { useState, useEffect } from "react"

export default function CourseCard({ a, onClick, activeDay, isHoliday }) {
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

    const calculateBuffer = () => {
        const attended = a.attendedClasses;
        const total = a.totalClasses;
        const percentage = (attended / total) * 100;

        if (percentage < 75) {
            const needed = Math.ceil((0.75 * total - attended) / (1 - 0.75));
            return { value: -(lab ? needed / 2 : needed), status: "danger" };
        } else {
            const canMiss = Math.floor(attended / 0.75 - total);
            if (canMiss === 0) {
                return { value: 0, status: "warning" };
            } else {
                return { value: (lab ? canMiss / 2 : canMiss), status: "safe" };
            }
        }
    };

    const buffer = calculateBuffer();

    return (
        <Card
            onClick={onClick}
            className={`group relative overflow-hidden rounded-2xl shadow-sm transition-all duration-300 cursor-pointer border
                ${(ongoing && !isHoliday)
                    ? "ring-2 ring-amber-400 shadow-lg bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/30 dark:to-slate-900 midnight:from-amber-950/20 midnight:to-black"
                    : "hover:shadow-lg hover:-translate-y-1 border-slate-200 dark:border-slate-700 midnight:border-gray-800"
                }`}
        >
            {/* Ongoing indicator */}
            {(ongoing && !isHoliday) && (
                <div className="absolute top-0 right-0 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                    Live
                </div>
            )}

            <div className="flex justify-between items-start p-4 gap-4">
                <div className="flex flex-col gap-3 flex-grow min-w-0">
                    <CardHeader className="p-0 space-y-1">
                        <CardTitle className="text-base font-semibold text-slate-800 dark:text-slate-100 midnight:text-slate-100 truncate">
                            {a.courseTitle}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 midnight:bg-gray-900 text-slate-600 dark:text-slate-300 midnight:text-slate-300">
                                {a.slotName}
                            </span>
                        </div>
                    </CardHeader>

                    <CardContent className="p-0 text-sm text-slate-600 dark:text-slate-300 midnight:text-slate-300 space-y-2">
                        <div className="flex items-center gap-2">
                            <Building2 size={14} className="text-slate-400 flex-shrink-0" />
                            <span className="truncate">{a.slotVenue}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock size={14} className="text-slate-400 flex-shrink-0" />
                            <span>{a.time}</span>
                        </div>

                        {/* Compact attendance info */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700 midnight:border-gray-800">
                            <span className="text-xs font-medium">
                                {a.attendedClasses}/{a.totalClasses} classes
                            </span>

                            {/* Buffer indicator */}
                            {buffer.status === "danger" && (
                                <div className="flex items-center gap-1 text-red-500 font-semibold text-sm">
                                    <TrendingDown size={16} />
                                    <span>{Math.abs(buffer.value)}</span>
                                </div>
                            )}
                            {buffer.status === "warning" && (
                                <div className="flex items-center gap-1 text-amber-500 font-semibold text-sm">
                                    <AlertTriangle size={16} />
                                    <span>0</span>
                                </div>
                            )}
                            {buffer.status === "safe" && (
                                <div className="flex items-center gap-1 text-green-500 font-semibold text-sm">
                                    <TrendingUp size={16} />
                                    <span>+{buffer.value}</span>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </div>

                {/* Circular progress */}
                <div className="w-20 h-20 flex-shrink-0">
                    <CircularProgressbar
                        value={a.attendancePercentage}
                        text={`${a.attendancePercentage}%`}
                        styles={buildStyles({
                            pathColor:
                                a.attendancePercentage < 75
                                    ? "#ef4444"
                                    : a.attendancePercentage < 85
                                        ? "#f59e0b"
                                        : "#10b981",
                            textColor: "currentColor",
                            trailColor: "#e2e8f0",
                            strokeLinecap: "round",
                            pathTransitionDuration: 0.5,
                            textSize: "24px",
                        })}
                    />
                </div>
            </div>
        </Card>
    );
}
