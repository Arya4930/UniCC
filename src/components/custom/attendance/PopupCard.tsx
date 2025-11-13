"use client"

import { useEffect, useState } from "react";
import { Building2, Clock, ChevronDown, ChevronUp, TrendingUp, TrendingDown, AlertTriangle, User, Hash } from "lucide-react"
import { CircularProgressbar, buildStyles } from "react-circular-progressbar"
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import "react-circular-progressbar/dist/styles.css"

type CalendarEvent = {
  text: string;
  type: "working" | "holiday";
  color: string;
  category?: string;
};

type RemainingClassDay = {
  date: number;
  weekday: string;
  type: string; 
  events?: CalendarEvent[];
  fullDate: Date;
};

export default function PopupCard({ a, setExpandedIdx, dayCardsMap, analyzeCalendars, impDates }) {
    const lab = a.slotName.split('')[0] === "L";

    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "";
        };
    }, []);

    const countTillDate = (endDate) => {
        if (!endDate) return null;
        const endMid = new Date(endDate);
        endMid.setHours(23, 59, 59, 999);

        const filteredMonths = analyzeCalendars.map((monthObj) => ({
            ...monthObj,
            days: monthObj.days.filter((d) => {
                if (!d.date || !d.weekday) return false;
                const monthStr = monthObj.month?.toLowerCase() || "";
                const mIndex = [
                    "january", "february", "march", "april", "may", "june",
                    "july", "august", "september", "october", "november", "december"
                ].findIndex((m) => monthStr.includes(m));

                const dFull = new Date(monthObj.year, mIndex, d.date);
                dFull.setHours(0, 0, 0, 0);
                return dFull <= endMid;
            }),
        }));

        return countRemainingClasses(a.courseCode, a.time, dayCardsMap, filteredMonths, new Date());
    };

    const isLab = a.courseCode.endsWith("(L)");
    const isTheory = a.courseCode.endsWith("(T)");

    let classesTillCAT1 = null;
    let classesTillCAT2 = null;
    let classesTillFAT = null;

    if (Array.isArray(analyzeCalendars) && analyzeCalendars.length > 0) {
        const allMonthsAreHolidays = analyzeCalendars.every(
            (month) => month?.summary?.working === 0
        );
        if (!allMonthsAreHolidays) {
            classesTillCAT1 = countTillDate(impDates.cat1Date);
            classesTillCAT2 = countTillDate(impDates.cat2Date);
            
            // For FAT, use appropriate date based on course type
            if (isLab) {
                classesTillFAT = countTillDate(impDates.lidLabDate);
            } else if (isTheory) {
                classesTillFAT = countTillDate(impDates.lidTheoryDate);
            }
        }
    }

    const calculateBuffer = () => {
        const attended = a.attendedClasses;
        const total = a.totalClasses;
        const percentage = (attended / total) * 100;

        if (percentage < 75) {
            const needed = Math.ceil((0.75 * total - attended) / (1 - 0.75));
            return { 
                value: -(lab ? needed / 2 : needed), 
                status: "danger", 
                text: `Attend ${lab ? needed / 2 : needed} more to reach 75%` 
            };
        } else {
            const canMiss = Math.floor(attended / 0.75 - total);
            if (canMiss === 0) {
                return { 
                    value: 0, 
                    status: "warning", 
                    text: "On the edge! Attend next class" 
                };
            } else {
                return { 
                    value: (lab ? canMiss / 2 : canMiss), 
                    status: "safe", 
                    // text: `Can miss ${lab ? canMiss / 2 : canMiss} and stay above 75%` 
                };
            }
        }
    };

    const buffer = calculateBuffer();
    const [openDropdown, setOpenDropdown] = useState(null);
    const toggleDropdown = (key) => setOpenDropdown(openDropdown === key ? null : key);

    // Filter out sections with no data or zero classes
    const upcomingSections = [
        { key: "CAT1", label: "Before CAT I", data: classesTillCAT1 },
        { key: "CAT2", label: "Before CAT II", data: classesTillCAT2 },
        { key: "FAT", label: "Before FAT", data: classesTillFAT },
    ].filter(section => section.data && Array.isArray(section.data) && section.data.length > 0);

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            setExpandedIdx(null);
        }
    };

    return (
        <div 
            className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4"
            onClick={handleBackdropClick}
        >
            <div className="bg-white dark:bg-slate-900 midnight:bg-black rounded-3xl shadow-2xl w-full max-w-md relative max-h-[90vh] overflow-hidden flex flex-col border border-slate-200 dark:border-slate-700 midnight:border-gray-800">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setExpandedIdx(null)}
                    className="top-4 right-4 absolute cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 midnight:hover:bg-gray-900 rounded-full z-10"
                >
                    <X size={20} className="text-slate-600 dark:text-slate-300 midnight:text-slate-200" />
                </Button>

                {/* Header with gradient */}
                <div className="relative bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 midnight:from-gray-900 midnight:to-black p-6 pb-20">
                    <div className="space-y-2">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 midnight:text-slate-100 pr-8 leading-tight">
                            {a.courseTitle}
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            <span className="text-xs font-medium px-3 py-1 rounded-full bg-white dark:bg-slate-800 midnight:bg-gray-900 text-slate-600 dark:text-slate-300 midnight:text-slate-300 border border-slate-200 dark:border-slate-700 midnight:border-gray-800">
                                {a.slotName}
                            </span>
                            <span className="text-xs font-medium px-3 py-1 rounded-full bg-white dark:bg-slate-800 midnight:bg-gray-900 text-slate-600 dark:text-slate-300 midnight:text-slate-300 border border-slate-200 dark:border-slate-700 midnight:border-gray-800">
                                {a.credits} Credits
                            </span>
                            <span className="text-xs font-medium px-3 py-1 rounded-full bg-white dark:bg-slate-800 midnight:bg-gray-900 text-slate-600 dark:text-slate-300 midnight:text-slate-300 border border-slate-200 dark:border-slate-700 midnight:border-gray-800">
                                {isLab ? "Lab" : "Theory"}
                            </span>
                        </div>
                    </div>

                    {/* Floating progress card */}
                    <div className="absolute -bottom-12 left-6 right-6 bg-white dark:bg-slate-800 midnight:bg-gray-900 rounded-2xl shadow-lg p-4 border border-slate-200 dark:border-slate-700 midnight:border-gray-800">
                        <div className="flex items-center gap-4">
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2">
                                    {buffer.status === "danger" && (
                                        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-50 dark:bg-red-950/30 midnight:bg-red-950/20 text-red-600 dark:text-red-400 font-semibold text-sm">
                                            <TrendingDown size={14} />
                                            <span>{Math.abs(buffer.value)}</span>
                                        </div>
                                    )}
                                    {buffer.status === "warning" && (
                                        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-50 dark:bg-amber-950/30 midnight:bg-amber-950/20 text-amber-600 dark:text-amber-400 font-semibold text-sm">
                                            <AlertTriangle size={14} />
                                            <span>0</span>
                                        </div>
                                    )}
                                    {buffer.status === "safe" && (
                                        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-50 dark:bg-green-950/30 midnight:bg-green-950/20 text-green-600 dark:text-green-400 font-semibold text-md">
                                            <TrendingUp size={18} />
                                            <span>+{buffer.value}</span>
                                        </div>
                                    )}
                                </div>
                                <p className={`text-sm font-medium ${
                                    buffer.status === "danger" ? "text-red-600 dark:text-red-400" :
                                    buffer.status === "warning" ? "text-amber-600 dark:text-amber-400" :
                                    "text-green-600 dark:text-green-400"
                                }`}>
                                    {buffer.text}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 midnight:text-slate-400">
                                    {a.attendedClasses} / {a.totalClasses} {isLab ? "labs" : "classes"} attended
                                </p>
                            </div>
                            <div className="w-20 h-20 flex-shrink-0">
                                <CircularProgressbar
                                    value={a.attendancePercentage}
                                    text={`${a.attendancePercentage}%`}
                                    styles={buildStyles({
                                        pathColor: buffer.status === "danger" ? "#ef4444" : buffer.status === "warning" ? "#f59e0b" : "#10b981",
                                        textColor: buffer.status === "danger" ? "#dc2626" : buffer.status === "warning" ? "#d97706" : "#059669",
                                        trailColor: "#e2e8f0",
                                        strokeLinecap: "round",
                                        textSize: "24px",
                                    })}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 pt-16 space-y-4">
                    {/* Details grid */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 midnight:bg-gray-900">
                            <Building2 size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
                            <div className="min-w-0">
                                <p className="text-xs text-slate-500 dark:text-slate-400 midnight:text-slate-400">Venue</p>
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-200 midnight:text-slate-200 truncate">{a.slotVenue}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 midnight:bg-gray-900">
                            <Clock size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
                            <div className="min-w-0">
                                <p className="text-xs text-slate-500 dark:text-slate-400 midnight:text-slate-400">Time</p>
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-200 midnight:text-slate-200">{a.time}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 midnight:bg-gray-900 col-span-2">
                            <User size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                                <p className="text-xs text-slate-500 dark:text-slate-400 midnight:text-slate-400">Faculty</p>
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-200 midnight:text-slate-200 truncate">{a.faculty}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 midnight:bg-gray-900 col-span-2">
                            <Hash size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
                            <div className="min-w-0">
                                <p className="text-xs text-slate-500 dark:text-slate-400 midnight:text-slate-400">Course Code</p>
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-200 midnight:text-slate-200">{a.courseCode.slice(0, -3)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Upcoming classes dropdowns */}
                    {upcomingSections.length > 0 && (
                        <div className="space-y-2">
                            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 midnight:text-slate-200">Upcoming {isLab ? "Labs" : "Classes"}</h3>
                            {upcomingSections.map(({ key, label, data }) => (
                                <div
                                    key={key}
                                    className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 midnight:border-gray-800"
                                >
                                    <button
                                        onClick={() => toggleDropdown(key)}
                                        className="flex items-center justify-between w-full px-4 py-3 text-left font-medium text-slate-800 dark:text-slate-200 midnight:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 midnight:hover:bg-gray-900 transition-colors"
                                    >
                                        <span className="text-sm">{label}: <strong>{data.length}</strong></span>
                                        {openDropdown === key ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                    </button>

                                    <div
                                        className={`transition-all duration-300 ease-in-out ${
                                            openDropdown === key ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
                                        } overflow-hidden`}
                                    >
                                        <div className="px-4 pb-4 bg-slate-50 dark:bg-slate-800/50 midnight:bg-gray-900/50">
                                            <UpcomingClassesList
                                                classes={data}
                                                attendedClasses={a.attendedClasses}
                                                totalClasses={a.totalClasses}
                                                isLab={isLab}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Attendance history */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 midnight:text-slate-200">Recent Attendance</h3>
                        <div className="space-y-1 max-h-48 overflow-y-auto">
                            {a.viewLink?.map((d, i) => (
                                <div
                                    key={i}
                                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs ${
                                        d.status.toLowerCase() === "absent"
                                            ? "bg-red-50 dark:bg-red-950/20 midnight:bg-red-950/10 text-red-700 dark:text-red-400"
                                            : d.status.toLowerCase() === "present"
                                                ? "bg-green-50 dark:bg-green-950/20 midnight:bg-green-950/10 text-green-700 dark:text-green-400"
                                                : d.status.toLowerCase() === "on duty"
                                                    ? "bg-amber-50 dark:bg-amber-950/20 midnight:bg-amber-950/10 text-amber-700 dark:text-amber-400"
                                                    : "bg-slate-50 dark:bg-slate-800 midnight:bg-gray-900 text-slate-700 dark:text-slate-300 midnight:text-slate-300"
                                    }`}
                                >
                                    <span className="font-medium">{d.date}</span>
                                    <span className="font-semibold">{d.status}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function countRemainingClasses(courseCode, slotTime, dayCardsMap, calendarMonths, fromDate = new Date()): RemainingClassDay[] | null {
    if (!courseCode || !dayCardsMap || !calendarMonths) return null;

    const daysWithSubject = Object.keys(dayCardsMap).filter(day =>
        dayCardsMap[day].some(c => c.courseCode === courseCode)
    );
    if (daysWithSubject.length === 0) return null;

    const normalizeDay = (d) => d.slice(0, 3).toUpperCase();
    const subjectDays = daysWithSubject.map(normalizeDay);

    const monthNames = [
        "january", "february", "march", "april", "may", "june",
        "july", "august", "september", "october", "november", "december"
    ];

    let startHour = 8, startMinute = 0;
    if (slotTime && slotTime.includes("-")) {
        const [start] = slotTime.split("-");
        const [hRaw, mRaw] = start.split(":");
        let h = Number(hRaw);
        const m = Number(mRaw) || 0;
        if (h >= 8 && h <= 11) {
        } else if (h === 12) {
            h = 12;
        } else if (h >= 1 && h <= 7) {
            h += 12;
        }
        startHour = h;
        startMinute = m;
    }

    const allDays = calendarMonths.flatMap(monthObj => {
        const monthStr = monthObj.month?.toString().toLowerCase() || "";
        const year = monthObj.year || new Date().getFullYear();

        const foundMonth = monthNames.find(m => monthStr.includes(m));
        const mIndex = foundMonth ? monthNames.indexOf(foundMonth) : -1;

        return (monthObj.days || []).map(day => {
            const fullDate = mIndex === -1 ? null : new Date(year, mIndex, day.date);
            const weekday = fullDate
                ? fullDate.toLocaleString("en-US", { weekday: "short" })
                : "";

            return { ...day, fullDate, weekday };
        });
    });

    const remainingWorkingDays = allDays.filter((d) => {
        if (!d || !d.fullDate || isNaN(d.fullDate.getTime())) return false;

        const isWorkingDay =
            d.type?.toLowerCase() === "working" ||
            (d.events?.some(ev =>
                ev.text?.toLowerCase().includes("instructional") ||
                ev.text?.toLowerCase().includes("working")
            ));

        if (!isWorkingDay) return false;

        let effectiveDay = normalizeDay(d.weekday || "");
        if (effectiveDay === "SAT" && Array.isArray(d.events)) {
            const dayOrderMap = {
                "monday": "MON",
                "tuesday": "TUE",
                "wednesday": "WED",
                "thursday": "THU",
                "friday": "FRI",
            };

            const found = d.events.find(ev =>
                /monday|tuesday|wednesday|thursday|friday/i.test(ev.category || ev.text)
            );

            if (found) {
                const match = found.category?.match(/(Monday|Tuesday|Wednesday|Thursday|Friday)/i) ||
                    found.text?.match(/(Monday|Tuesday|Wednesday|Thursday|Friday)/i);
                if (match) effectiveDay = dayOrderMap[match[1].toLowerCase()];
            }
        }

        if (!subjectDays.includes(effectiveDay)) return false;

        const classTime = new Date(d.fullDate);
        classTime.setHours(startHour, startMinute, 0, 0);
        if (classTime < fromDate) return false;

        return true;
    });

    return remainingWorkingDays;
}

function UpcomingClassesList({ classes, attendedClasses = 0, totalClasses = 0, isLab = false }) {
    const [notAttending, setNotAttending] = useState([]);

    if (!classes || classes.length === 0) {
        return (
            <p className="text-slate-500 dark:text-slate-400 midnight:text-slate-500 text-xs text-center py-4">
                No upcoming {isLab ? "labs" : "classes"} 🎉
            </p>
        );
    }

    const toggleAttendance = (index) => {
        setNotAttending((prev) =>
            prev.includes(index)
                ? prev.filter((i) => i !== index)
                : [...prev, index]
        );
    };

    const upcomingCount = classes.length;
    const missedCount = notAttending.length;
    const attendCount = upcomingCount - missedCount;

    const predictedAttended = attendedClasses + attendCount;
    const predictedTotal = totalClasses + upcomingCount;
    const predictedPercent = parseFloat(((predictedAttended / predictedTotal) * 100).toFixed(1));

    return (
        <div className="space-y-3 pt-3">
            <div className="flex items-center justify-between text-xs font-medium px-3 py-2 rounded-lg bg-white dark:bg-slate-900 midnight:bg-black border border-slate-200 dark:border-slate-700 midnight:border-gray-800">
                <div className="flex items-center gap-4">
                    <span className="text-green-600 dark:text-green-400">
                        <TrendingUp size={12} className="inline mr-1" />
                        {attendCount}
                    </span>
                    <span className="text-red-500 dark:text-red-400">
                        <TrendingDown size={12} className="inline mr-1" />
                        {missedCount}
                    </span>
                </div>
                <span className={`font-semibold ${
                    predictedPercent >= 75 ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"
                }`}>
                    → {predictedPercent}%
                </span>
            </div>

            <div className="grid grid-cols-5 gap-2">
                {classes.map((day, i) => {
                    const d = new Date(day.fullDate);
                    const dateStr = d.getDate();
                    const monthStr = d.toLocaleDateString("en-IN", { month: "short" });
                    const isSkipped = notAttending.includes(i);

                    return (
                        <button
                            key={i}
                            onClick={() => toggleAttendance(i)}
                            className={`relative flex flex-col items-center justify-center rounded-xl p-2 text-center cursor-pointer transition-all duration-200 ${
                                isSkipped
                                    ? "bg-red-100 dark:bg-red-950/40 midnight:bg-red-950/20 border-2 border-red-300 dark:border-red-700 midnight:border-red-800"
                                    : "bg-white dark:bg-slate-900 midnight:bg-gray-950 border-2 border-slate-200 dark:border-slate-700 midnight:border-gray-800 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md"
                            }`}
                        >
                            <span className={`text-base font-bold ${
                                isSkipped
                                    ? "text-red-700 dark:text-red-300 midnight:text-red-400"
                                    : "text-slate-800 dark:text-slate-200 midnight:text-slate-200"
                            }`}>
                                {dateStr}
                            </span>
                            <span className={`text-[9px] ${
                                isSkipped
                                    ? "text-red-500 dark:text-red-400"
                                    : "text-slate-500 dark:text-slate-400"
                            }`}>
                                {monthStr}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}