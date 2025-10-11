"use client";
import React, { useMemo, useState, useEffect } from "react";
import { eachDayOfInterval, endOfMonth, getDay } from "date-fns";

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

export default function CalendarView({ calendars, calendarType }) {
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
        let y = Number(activeCalendar.year);
        if (!Number.isFinite(y)) y = now.getFullYear();

        let mIndex;
        try {
            const mRaw = activeCalendar.month;
            if (mRaw == null) mIndex = now.getMonth();
            else if (typeof mRaw === "number") {
                if (mRaw >= 1 && mRaw <= 12) mIndex = mRaw - 1;
                else if (mRaw >= 0 && mRaw <= 11) mIndex = mRaw;
                else mIndex = now.getMonth();
            } else {
                const s = String(mRaw).trim();
                const n = Number(s);
                if (!Number.isNaN(n)) {
                    mIndex = n >= 1 && n <= 12 ? n - 1 : now.getMonth();
                } else {
                    const parsed = Date.parse(`${s} 1, ${y}`);
                    mIndex = !Number.isNaN(parsed)
                        ? new Date(parsed).getMonth()
                        : MONTH_NAME_MAP[s.toLowerCase().slice(0, 3)] ?? now.getMonth();
                }
            }
        } catch {
            mIndex = now.getMonth();
        }
        return { year: y, monthIndex: mIndex };
    }, [activeCalendar.month, activeCalendar.year]);

    if (!safeCalendars.length) {
        return (
            <div className="text-center text-gray-500 dark:text-gray-400 p-4">
                No calendar data available. / Reload Data
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
        <div className="flex flex-col gap-4">
            <h1 className="text-lg font-semibold mb-3 text-center text-gray-800 dark:text-gray-100 midnight:text-gray-100">
                Academic Calendar ({CALENDAR_TYPES[calendarType || "ALL"]})
            </h1>
            <div className="flex gap-2 mb-3 justify-center flex-wrap">
                {safeCalendars.map((calendar, idx) => (
                    <button
                        key={calendar.id}
                        onClick={() => setActiveIdx(idx)}
                        className={`px-4 py-2 rounded-md text-sm md:text-base font-medium transition-colors duration-150 ${idx === activeIdx
                            ? "bg-blue-600 text-white dark:bg-blue-700 midnight:bg-blue-800"
                            : "bg-gray-200 text-gray-700 hover:bg-blue-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 midnight:bg-black midnight:text-gray-200 midnight:hover:bg-gray-800 midnight:outline midnight:outline-1 midnight:outline-gray-800"
                            }`}
                    >
                        {calendar.month ?? "Month"} {calendar.year ?? ""}
                    </button>
                ))}
            </div>

            <div data-scrollable key={activeIdx} className="w-full">
                <h2 className="text-2xl font-semibold mb-4 text-center text-gray-800 dark:text-gray-100 midnight:text-gray-200">
                    {activeCalendar.month ?? monthStart.toLocaleString(undefined, { month: "long" })}
                </h2>

                <div className="overflow-x-auto">
                    <div className="w-full min-w-[950px] grid grid-cols-7 text-center border-collapse">
                        {weekdays.map((day) => (
                            <div
                                key={day}
                                className="font-semibold py-2 border-b text-gray-700 dark:text-gray-200 midnight:text-gray-100 bg-gray-100 dark:bg-gray-800 midnight:bg-gray-900"
                            >
                                {day}
                            </div>
                        ))}

                        {blanks.map((_, i) => (
                            <div key={`blank-${i}`} className="h-36" />
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
                                    ? "bg-red-50 dark:bg-red-900/30 midnight:bg-red-900/30"
                                    : dayType === "instructional"
                                        ? "bg-green-50 dark:bg-green-900/30 midnight:bg-green-900/30"
                                        : dayType === "semiholiday"
                                            ? "bg-yellow-50 dark:bg-yellow-900/30 midnight:bg-yellow-900/30"
                                            : "bg-gray-50 dark:bg-gray-900/30 midnight:bg-gray-900/30";

                            return (
                                <div
                                    key={date}
                                    className={`relative flex flex-col items-start justify-start p-3 h-42 ${bgClass} shadow-sm`}
                                >
                                    <div className="w-full flex items-center justify-between">
                                        <div className="text-lg font-bold text-left text-gray-800 dark:text-gray-100 midnight:text-gray-200">
                                            {date}
                                        </div>
                                        <div
                                            className={`text-xs font-semibold px-2 py-0.5 rounded ${dayType === "holiday"
                                                    ? "bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-100 midnight:bg-red-900 midnight:text-red-200"
                                                    : dayType === "instructional"
                                                        ? "bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-100 midnight:bg-green-900 midnight:text-green-200"
                                                        : dayType === "semiholiday"
                                                            ? "bg-yellow-200 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100 midnight:bg-yellow-900 midnight:text-yellow-200"
                                                            : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100 midnight:bg-gray-800 midnight:text-gray-200"
                                                }`}
                                        >
                                            {dayType === "holiday"
                                                ? "Holiday"
                                                : dayType === "instructional"
                                                    ? "Working"
                                                    : dayType === "semiholiday"
                                                        ? "On Campus"
                                                        : "Other"}
                                        </div>
                                    </div>

                                    <div className="mt-2 w-full text-left overflow-y-auto max-h-32">
                                        {events.length > 0 && (
                                            <ul className="mt-2 space-y-1 text-xs text-gray-600 dark:text-gray-300 midnight:text-gray-200">
                                                {events.slice(1).map((e, i) => {
                                                    const tagClass = isHolidayEvent(e)
                                                        ? "bg-red-100 text-red-800 border-red-200 dark:bg-red-800/40 dark:text-red-200 midnight:bg-red-950/40 midnight:text-red-300"
                                                        : isInstructionalEvent(e)
                                                            ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-800/40 dark:text-green-200 midnight:bg-green-950/40 midnight:text-green-300"
                                                            : "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-800/40 dark:text-yellow-200 midnight:bg-yellow-950/40 midnight:text-yellow-300";
                                                    const label = e.category && e.category !== "General" ? e.category : e.text;
                                                    const parts = String(label).split("/").map(p => p.trim()).filter(Boolean);
                                                    return parts.map((p, j) => (
                                                        <li
                                                            key={`${i}-${j}`}
                                                            className={`inline-block px-2 py-1 rounded border ${tagClass} mr-1 mb-1`}
                                                            title={e.text}
                                                        >
                                                            {p.replace(/^\(|\)$/g, "")}
                                                        </li>
                                                    ));
                                                })}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
