"use client";
import React, { useMemo, useState, useEffect } from "react";
import { eachDayOfInterval, endOfMonth, getDay } from "date-fns";
import NoContentFound from "../NoContentFound";
import { RefreshCcw } from "lucide-react";

const CALENDAR_TYPES = {
    ALL: "General Semester",
    ALL02: "General Flexible",
    ALL03: "General Freshers",
    ALL05: "General LAW",
    ALL06: "Flexible Freshers",
    ALL08: "Cohort LAW",
    ALL11: "Flexible Research",
    WEI: "Weekend Intra Semester",
};

const HOLIDAY_KEYWORDS = [
    "holiday", "pooja", "puja", "ayudha", "diwali", "pongal", "eid", "christmas", "good friday",
    "independence", "republic", "onam", "holi", "ramadan", "ganesh", "maha shivaratri", "vesak",
    "vacation", "term end", "no instructional", "noinstructional", "vinayakar chathurthi", "gandhi jayanthi"
];

function normalize(str = "") {
    return String(str).toLowerCase().replace(/[^a-z0-9\s]/g, " ").trim();
}

function isHolidayEvent(e) {
    if (!e) return false;
    const type = String(e.type || "").toLowerCase();
    const text = normalize(e.text || "");
    const cat = normalize(e.category || "");
    if (type.includes("holiday")) return true;
    if (type.includes("no instructional")) return true;
    if (cat.includes("no instructional")) return true;
    for (const kw of HOLIDAY_KEYWORDS) {
        if (text.includes(kw) || cat.includes(kw)) return true;
    }
    return false;
}

function isInstructionalEvent(e) {
    if (!e) return false;
    const type = String(e.type || "").toLowerCase();
    const cat = normalize(e.category || "");
    if (type === "instructional day") return true;
    if (cat.includes("working")) return true;
    return false;
}

const MONTH_NAME_MAP = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

export default function CalendarView({ calendars, calendarType, handleCalendarFetch }) {
    const [selectedType, setSelectedType] = useState(calendarType || "ALL");
    const safeCalendars = useMemo(() => {
        if (!calendars) return [];
        if (Array.isArray(calendars)) return calendars;
        if (calendars.calendars) return calendars.calendars;
        return [calendars];
    }, [calendars]);

    const [activeIdx, setActiveIdx] = useState(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("calendar-active-index");
            return saved ? Number(saved) || 0 : 0;
        }
        return 0;
    });

    useEffect(() => {
        localStorage.setItem("calendar-active-index", String(activeIdx));
    }, [activeIdx]);

    const activeCalendar = safeCalendars[activeIdx] || {};
    const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    const { year, monthIndex } = useMemo(() => {
        const now = new Date();

        const MONTH_NAME_MAP = {
            jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
            jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
        };

        const getMonthIndex = (mRaw: unknown): number => {
            if (!mRaw) return now.getMonth();
            if (typeof mRaw === "number") {
                if (mRaw >= 1 && mRaw <= 12) return mRaw - 1;
                if (mRaw >= 0 && mRaw <= 11) return mRaw;
            }
            const s = String(mRaw).trim().toLowerCase();
            const short = s.slice(0, 3);
            return MONTH_NAME_MAP[short] ?? now.getMonth();
        };

        const mIndex = getMonthIndex(activeCalendar.month);
        const currYear = now.getFullYear();

        const y = mIndex <= 4 ? currYear + 1 : currYear;

        return { year: y, monthIndex: mIndex };
    }, [activeCalendar.month]);


    function handleSubmitCalendarType() {
        handleCalendarFetch(selectedType);
    }

    if (!safeCalendars.length) {
        return (
            <div className="flex flex-col items-center justify-center gap-5 p-6 text-center">
                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 midnight:text-slate-100">
                    Select Calendar Type
                </h2>

                <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 
                               dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100
                               midnight:bg-black midnight:text-slate-100 midnight:border-gray-800
                               focus:outline-none focus:ring-2 focus:ring-slate-400 transition"
                >
                    {Object.entries(CALENDAR_TYPES).map(([value, label]) => (
                        <option key={value} value={value}>
                            {label}
                        </option>
                    ))}
                </select>

                <button
                    onClick={handleSubmitCalendarType}
                    className="px-6 py-2 rounded-xl font-medium text-white bg-slate-600 hover:bg-slate-700 
                               dark:bg-slate-700 dark:hover:bg-slate-600
                               midnight:bg-slate-800 midnight:hover:bg-slate-700
                               transition-colors duration-150"
                >
                    Load Calendar
                </button>
            </div>
        );
    }

    let monthStart = new Date(year, monthIndex, 1);
    let daysInMonth = [];
    try {
        const monthEnd = endOfMonth(monthStart);
        daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    } catch {
        const totalDays = Number(activeCalendar.totalDays) || 31;
        daysInMonth = Array.from({ length: totalDays }, (_, i) => new Date(year, monthIndex, i + 1));
    }

    const firstDay = getDay(monthStart);
    const blanksCount = (firstDay + 6) % 7;
    const blanks = Array.from({ length: blanksCount }, (_, i) => i);

    return (
        <div className="flex flex-col gap-6">
            {/* Calendar Type Selector - No background */}
            <div className="flex items-center justify-center gap-3 p-4">
                <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 
                               dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100
                               midnight:bg-black midnight:text-slate-100 midnight:border-gray-800
                               focus:outline-none focus:ring-2 focus:ring-slate-400 transition"
                >
                    {Object.entries(CALENDAR_TYPES).map(([value, label]) => (
                        <option key={value} value={value}>
                            {label}
                        </option>
                    ))}
                </select>

                <button
                    onClick={handleSubmitCalendarType}
                    className="px-4 py-2 rounded-xl font-medium text-white bg-slate-600 hover:bg-slate-700 
                               dark:bg-slate-700 dark:hover:bg-slate-600
                               midnight:bg-slate-800 midnight:hover:bg-slate-700
                               transition-colors duration-150"
                >
                    Change Type
                </button>

                <button 
                    onClick={() => handleCalendarFetch(calendarType || "ALL")} 
                    className="px-4 py-2 rounded-xl bg-slate-600 hover:bg-slate-700 text-white font-medium transition-colors"
                >
                    <RefreshCcw className="w-4 h-4" />
                </button>
            </div>

            {/* Header */}
            <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-3">
                    <div className="h-1 w-12 bg-gradient-to-r from-transparent to-slate-600 dark:to-slate-400 rounded-full" />
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 midnight:text-slate-100">
                        Academic Calendar
                    </h1>
                    <div className="h-1 w-12 bg-gradient-to-l from-transparent to-slate-600 dark:to-slate-400 rounded-full" />
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 midnight:text-slate-400">
                    {CALENDAR_TYPES[calendarType || "ALL"]}
                </p>
            </div>

            {/* Month Navigation */}
            <div className="flex gap-2 mb-3 justify-center flex-wrap">
                {safeCalendars.map((calendar, idx) => (
                    <button
                        key={calendar.id}
                        onClick={() => setActiveIdx(idx)}
                        className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                            idx === activeIdx
                                ? "bg-slate-700 text-white shadow-lg scale-105 dark:bg-slate-600 midnight:bg-slate-800"
                                : "bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 midnight:bg-gray-900 midnight:text-slate-200 midnight:hover:bg-gray-800 border border-slate-200 dark:border-slate-700 midnight:border-gray-800"
                        }`}
                    >
                        {calendar.month ?? "Month"} {calendar.year ?? ""}
                    </button>
                ))}
            </div>

            {/* Calendar Grid */}
            <div data-scrollable key={activeIdx} className="w-full">
                <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700 midnight:border-gray-800 shadow-lg">
                    <div className="w-full min-w-[950px]">
                        {/* Weekday Headers */}
                        <div className="grid grid-cols-7 bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 midnight:from-gray-900 midnight:to-black">
                            {weekdays.map((day) => (
                                <div
                                    key={day}
                                    className="font-semibold py-3 text-center text-slate-700 dark:text-slate-200 midnight:text-slate-100 border-r border-slate-200 dark:border-slate-700 midnight:border-gray-800 last:border-r-0"
                                >
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar Days */}
                        <div className="grid grid-cols-7 bg-white dark:bg-slate-900 midnight:bg-black">
                            {blanks.map((_, i) => (
                                <div 
                                    key={`blank-${i}`} 
                                    className="h-32 border-r border-b border-slate-200 dark:border-slate-700 midnight:border-gray-800 bg-slate-50 dark:bg-slate-800/50 midnight:bg-gray-900/50"
                                />
                            ))}

                            {daysInMonth.map((dateObj) => {
                                const date = dateObj.getDate();
                                const dayInfo = Array.isArray(activeCalendar.days)
                                    ? activeCalendar.days.find((d) => Number(d.date) === date)
                                    : undefined;
                                const events = dayInfo?.events || [];

                                const hasHoliday = events.some(isHolidayEvent);
                                const hasInstructional = events.some(isInstructionalEvent);
                                const isEmpty = events.length === 0;

                                const semiHolidayEvents = ["CAT - I", "CAT - II", "TechnoVIT", "Vibrance"];
                                const hasSemiHoliday = events.some(e =>
                                    semiHolidayEvents.some(keyword =>
                                        (e.text || "").toLowerCase().includes(keyword.toLowerCase()) ||
                                        (e.category || "").toLowerCase().includes(keyword.toLowerCase())
                                    )
                                );

                                let dayType = "other";
                                if (hasSemiHoliday) dayType = "semiholiday";
                                else if (hasHoliday || isEmpty || (!hasInstructional && events.length > 0)) dayType = "holiday";
                                else if (hasInstructional) dayType = "instructional";

                                const bgClass =
                                    dayType === "holiday"
                                        ? "bg-red-50 dark:bg-red-950/20 midnight:bg-red-950/10"
                                        : dayType === "instructional"
                                        ? "bg-green-50 dark:bg-green-950/20 midnight:bg-green-950/10"
                                        : dayType === "semiholiday"
                                        ? "bg-amber-50 dark:bg-amber-950/20 midnight:bg-amber-950/10"
                                        : "bg-white dark:bg-slate-900 midnight:bg-black";

                                return (
                                    <div
                                        key={date}
                                        className={`relative flex flex-col p-3 h-40 border-r border-b border-slate-200 dark:border-slate-700 midnight:border-gray-800 ${bgClass} hover:shadow-lg transition-all duration-200 group overflow-hidden`}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <span className="text-lg font-bold text-slate-800 dark:text-slate-100 midnight:text-slate-100">
                                                {date}
                                            </span>
                                            <span
                                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                                    dayType === "holiday"
                                                        ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                                                        : dayType === "instructional"
                                                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                                                        : dayType === "semiholiday"
                                                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                                                        : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                                                }`}
                                            >
                                                {dayType === "holiday" ? "Holiday" : dayType === "instructional" ? "Working" : dayType === "semiholiday" ? "On Campus" : "Other"}
                                            </span>
                                        </div>

                                        <div className="flex-1 overflow-y-auto space-y-1">
                                            {events.map((e, i) => {
                                                const tagClass = isHolidayEvent(e)
                                                    ? "bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800/30"
                                                    : isInstructionalEvent(e)
                                                    ? "bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800/30"
                                                    : "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800/30";
                                                
                                                const label = e.category && e.category !== "General" ? e.category : e.text;
                                                
                                                return (
                                                    <div
                                                        key={i}
                                                        className={`text-[10px] px-2 py-0.5 rounded ${tagClass} break-words leading-tight`}
                                                        title={e.text}
                                                    >
                                                        {label}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700/50" />
                    <span className="text-slate-700 dark:text-slate-300">Working Day</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700/50" />
                    <span className="text-slate-700 dark:text-slate-300">Holiday</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700/50" />
                    <span className="text-slate-700 dark:text-slate-300">On Campus</span>
                </div>
            </div>
        </div>
    );
}
