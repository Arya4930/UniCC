"use client";

import config from "@/app/config.json";
import { useEffect } from "react";

export default function TimetableVtop({ attendance }) {
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "";
        };
    }, []);
    
    const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
    const slotMap = config.slotMap || {};

    function toMinutes(t) {
        const [hs = "0", ms = "0"] = String(t).split(":");
        let h = parseInt(hs || "0", 10);
        const m = parseInt(ms || "0", 10);
        const isPM = h === 12 || (h >= 1 && h <= 7);
        if (isPM && h !== 12) h += 12;
        return h * 60 + m;
    }

    function fmt(t) {
        if (!t) return "";
        const [hs = "0", ms = "0"] = String(t).split(":");
        let h = parseInt(hs || "0", 10);
        const m = parseInt(ms || "0", 10);
        const isPM = h === 12 || (h >= 1 && h <= 7);
        let disp = h;
        if (!isPM && h === 0) disp = 12;
        if (disp > 12) disp -= 12;
        return `${disp}:${String(m).padStart(2, "0")} ${isPM ? "PM" : "AM"}`;
    }

    function fmtRange(r) {
        if (!r) return null;
        const [s, e] = r.split("-");
        return (
            <div className="flex flex-col text-[11px] leading-tight">
                <span>{fmt(s)}</span>
                <span className="text-[9px] opacity-60">to</span>
                <span>{fmt(e)}</span>
            </div>
        );
    }

    const grid = {};
    days.forEach((d) => (grid[d] = {}));
    (attendance || []).forEach((course) => {
        const slots = String(course.slotName || "")
            .split("+")
            .map((s) => s.trim())
            .filter(Boolean);

        slots.forEach((slot) => {
            days.forEach((day) => {
                if (slotMap[day]?.[slot]) {
                    grid[day][slot] = { title: course.courseTitle || "" };
                }
            });
        });
    });

    const monTheory = [];
    const monLab = [];

    Object.keys(slotMap["MON"]).forEach((slot) => {
        const time = slotMap["MON"][slot]?.time;
        if (!time) return;
        const start = toMinutes(time.split("-")[0]);
        if (slot.startsWith("L")) monLab.push({ slot, time, start });
        else monTheory.push({ slot, time, start });
    });

    monTheory.sort((a, b) => a.start - b.start);
    monLab.sort((a, b) => a.start - b.start);

    const maxPairs = Math.max(monTheory.length, monLab.length);
    const mergedPairs = Array.from({ length: maxPairs }).map((_, i) => ({
        theory: monTheory[i] || null,
        lab: monLab[i] || null,
    }));

    const LUNCH_START_MIN = toMinutes("1:20");
    let insertIndex = mergedPairs.findIndex((p) => {
        const start = Math.min(
            p.theory ? p.theory.start : Infinity,
            p.lab ? p.lab.start : Infinity
        );
        return start >= LUNCH_START_MIN;
    });
    if (insertIndex === -1) insertIndex = mergedPairs.length;

    const beforeLunch = mergedPairs.slice(0, insertIndex);
    const afterLunch = mergedPairs.slice(insertIndex);

    function slotsMatchingTimes(day, pair) {
        const times = new Set();
        if (pair.theory?.time) times.add(pair.theory.time);
        if (pair.lab?.time) times.add(pair.lab.time);

        const out = [];
        Object.keys(slotMap[day] || {}).forEach((s) => {
            const t = slotMap[day][s]?.time;
            if (times.has(t)) out.push(s);
        });

        if (out.length === 0) {
            const wanted = [];
            if (pair.theory?.time)
                wanted.push(toMinutes(pair.theory.time.split("-")[0]));
            if (pair.lab?.time)
                wanted.push(toMinutes(pair.lab.time.split("-")[0]));

            Object.keys(slotMap[day] || {}).forEach((s) => {
                const t = slotMap[day][s]?.time;
                if (!t) return;
                const st = toMinutes(t.split("-")[0]);
                if (wanted.some((ws) => Math.abs(st - ws) <= 7)) out.push(s);
            });
        }

        return [...new Set(out)];
    }

    function buildCell(day, pair) {
        const matched = slotsMatchingTimes(day, pair);
        const slotsNow = matched.length
            ? matched
            : [pair.theory?.slot, pair.lab?.slot].filter(Boolean);

        const unique = [...new Set(slotsNow)];
        const title = unique.map((s) => grid[day][s]?.title).find(Boolean);

        return { slotLabel: unique.join(" / "), title };
    }

    const neon = "bg-[#39FF14]/30 dark:bg-[#39FF14]/20 midnight:bg-[#39FF14]/10";
    const normal = "bg-white dark:bg-[#061017] midnight:bg-[#030507]";

    const headerClass =
        "border px-1 py-1 bg-[#eef2ff] dark:bg-[#071925] midnight:bg-[#04070a] min-w-[100px] text-[11px]";
    const lunchHeaderClass =
        "border px-1 py-1 bg-gray-300 dark:bg-[#162029] midnight:bg-[#0b1a22] min-w-[100px] text-[11px] font-semibold";
    const cellBase =
        "border px-2 py-1 min-w-[100px] h-[56px] text-[12px]";

    return (
        <div className="overflow-x-auto mt-3 w-full">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 midnight:text-gray-100 mb-2">
                Timetable
            </h2>
            <table data-scrollable className="border-collapse w-full text-center">
                <thead>
                    <tr>
                        <th className="border px-3 py-2 bg-gray-200 dark:bg-gray-800 midnight:bg-black">
                            DAY
                        </th>

                        {beforeLunch.map((p, i) => (
                            <th key={i} className={headerClass}>
                                {p.theory && fmtRange(p.theory.time)}
                                {p.lab && (
                                    <div className="opacity-70">{fmtRange(p.lab.time)}</div>
                                )}
                            </th>
                        ))}

                        <th className={lunchHeaderClass}>
                            <div className="flex flex-col items-center gap-1">
                                <div className="text-[11px] font-semibold">LUNCH</div>
                            </div>
                        </th>

                        {afterLunch.map((p, i) => (
                            <th key={i} className={headerClass}>
                                {p.theory && fmtRange(p.theory.time)}
                                {p.lab && (
                                    <div className="opacity-70">{fmtRange(p.lab.time)}</div>
                                )}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {days.map((day) => (
                        <tr key={day}>
                            <td className="border font-semibold bg-gray-100 dark:bg-[#07101a] midnight:bg-[#020409]">
                                {day}
                            </td>

                            {beforeLunch.map((p, i) => {
                                const { slotLabel, title } = buildCell(day, p);
                                const colorClass = title ? neon : normal;
                                return (
                                    <td key={i} className={`${cellBase} ${colorClass}`}>
                                        <div>{slotLabel}</div>
                                        {title && (
                                            <div className="text-[11px] opacity-80 mt-1">
                                                {title}
                                            </div>
                                        )}
                                    </td>
                                );
                            })}

                            <td className={lunchHeaderClass}></td>

                            {afterLunch.map((p, i) => {
                                const { slotLabel, title } = buildCell(day, p);
                                const colorClass = title ? neon : normal;
                                return (
                                    <td key={i} className={`${cellBase} ${colorClass}`}>
                                        <div>{slotLabel}</div>
                                        {title && (
                                            <div className="text-[11px] opacity-80 mt-1">
                                                {title}
                                            </div>
                                        )}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
