"use client";
import React, { useMemo, useState } from "react";

const HOLIDAY_KEYWORDS = [
    "holiday",
    "pooja",
    "puja",
    "ayudha",
    "diwali",
    "pongal",
    "eid",
    "christmas",
    "good friday",
    "independence",
    "republic",
    "onam",
    "holi",
    "ramadan",
    "ganesh",
    "maha shivaratri",
    "vesak",
    "vacation",
    "term end",
    "no instructional",
    "noinstructional",
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

export default function CalendarView({ calendars }) {
    const safeCalendars = useMemo(() => {
        if (!calendars) return [];
        if (Array.isArray(calendars)) return calendars;
        if (calendars.calendars) return calendars.calendars;
        return [calendars];
    }, [calendars]);

    const [activeIdx, setActiveIdx] = useState(0);

    if (!safeCalendars.length) {
        return (
            <div className="text-center text-gray-500 dark:text-gray-400 p-4">
                No calendar data available. / Reload Data
            </div>
        );
    }

    const activeCalendar = safeCalendars[activeIdx];

    return (
        <div className="flex flex-col gap-10 p-4">
            {/* Tabs */}
            <div className="flex flex-wrap justify-center gap-2 mb-6">
                {safeCalendars.map((calendar, idx) => (
                    <button
                        key={idx}
                        onClick={() => setActiveIdx(idx)}
                        className={`px-4 py-2 rounded-full font-medium transition-colors ${idx === activeIdx
                                ? "bg-blue-600 text-white"
                                : "bg-gray-200 dark:bg-gray-700 dark:text-gray-300 text-gray-700"
                            }`}
                    >
                        {calendar.month}
                    </button>
                ))}
            </div>

            {/* Active month */}
            <div key={activeIdx} className="w-full">
                <h2 className="text-2xl font-semibold mb-4 text-center text-gray-800 dark:text-gray-100">
                    {activeCalendar.month}
                </h2>

                <div className="grid grid-cols-7 gap-3 text-center">
                    {Array.from({ length: 31 }, (_, i) => {
                        const date = i + 1;
                        const dayInfo = Array.isArray(activeCalendar.days)
                            ? activeCalendar.days.find((d) => d.date === date)
                            : undefined;
                        const events = dayInfo?.events || [];

                        const hasHoliday = events.some(isHolidayEvent);
                        const hasInstructional = events.some(isInstructionalEvent);
                        const isEmpty = events.length === 0;

                        let dayType = "other";
                        if (hasHoliday || isEmpty || (!hasInstructional && events.length > 0))
                            dayType = "holiday";
                        else if (hasInstructional) dayType = "instructional";

                        const bgClass =
                            dayType === "holiday"
                                ? "bg-red-50 border-red-200"
                                : dayType === "instructional"
                                    ? "bg-green-50 border-green-200"
                                    : "bg-yellow-50 border-yellow-200";

                        const borderClass =
                            dayType === "holiday"
                                ? "border-red-300"
                                : dayType === "instructional"
                                    ? "border-green-300"
                                    : "border-yellow-300";

                        return (
                            <div
                                key={date}
                                className={`relative flex flex-col items-start justify-start border-2 rounded-xl p-3 h-36 ${bgClass} ${borderClass} shadow-sm`}
                            >
                                <div className="w-full flex items-center justify-between">
                                    <div className="text-lg font-bold text-left">{date}</div>
                                    <div
                                        className={`text-xs font-semibold px-2 py-0.5 rounded ${dayType === "holiday"
                                                ? "bg-red-200 text-red-800"
                                                : dayType === "instructional"
                                                    ? "bg-green-200 text-green-800"
                                                    : "bg-yellow-200 text-yellow-800"
                                            }`}
                                    >
                                        {dayType === "holiday"
                                            ? "Holiday"
                                            : dayType === "instructional"
                                                ? "Working"
                                                : "Other"}
                                    </div>
                                </div>

                                <div className="mt-2 w-full text-left">
                                    {events.length > 0 && (
                                        <ul className="mt-2 space-y-1 text-xs text-gray-600 dark:text-gray-300 max-h-20 overflow-auto">
                                            {events.map((e, i) => {
                                                const tagClass = isHolidayEvent(e)
                                                    ? "bg-red-100 text-red-800 border-red-200"
                                                    : isInstructionalEvent(e)
                                                        ? "bg-green-100 text-green-800 border-green-200"
                                                        : "bg-yellow-100 text-yellow-800 border-yellow-200";
                                                const label =
                                                    e.category && e.category !== "General"
                                                        ? e.category
                                                        : e.text;
                                                return (
                                                    <li
                                                        key={i}
                                                        className={`inline-block px-2 py-1 rounded border ${tagClass} mr-1 mb-1`}
                                                        title={e.text}
                                                    >
                                                        {label.replace(/^\(|\)$/g, "")}
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="flex justify-center gap-6 mt-6 text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded bg-green-300 border border-green-500"></span>
                        Instructional / Working
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded bg-yellow-300 border border-yellow-500"></span>
                        Special / Other
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded bg-red-300 border border-red-500"></span>
                        Holiday / No Event
                    </div>
                </div>
            </div>
        </div>
    );
}
