"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";

export default function OverallAttendancePredictor({
  attendanceData,
  analyzeCalendars,
  dayCardsMap,
  impDates,
}) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const [dateStates, setDateStates] = useState({});
  const [mode, setMode] = useState("LID"); // CAT1, CAT2, LID

  const allWorkingDays = useMemo(() => {
    if (!Array.isArray(analyzeCalendars)) return [];

    const monthNames = [
      "january", "february", "march", "april", "may", "june",
      "july", "august", "september", "october", "november", "december"
    ];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return analyzeCalendars.flatMap((monthObj) => {
      const monthStr = monthObj.month?.toLowerCase() || "";
      const year = monthObj.year || new Date().getFullYear();
      const foundMonth = monthNames.find((m) => monthStr.includes(m));
      const mIndex = foundMonth ? monthNames.indexOf(foundMonth) : -1;

      return (monthObj.days || [])
        .filter((d) => d.type?.toLowerCase() === "working")
        .map((d) => {
          const dateObj = mIndex === -1 ? null : new Date(year, mIndex, d.date);
          if (!dateObj || dateObj < today) return null;
          return {
            date: dateObj,
            weekday: d.weekday,
            month: monthObj.month,
            year: monthObj.year,
            events: d.events || [],
          };
        })
        .filter(Boolean);
    });
  }, [analyzeCalendars]);

  const [monthIdx, setMonthIdx] = useState(0);

  const monthsAvailable = Array.from(
    new Set(allWorkingDays.map((d) => `${d.month} ${d.year}`))
  );
  const currentMonth = monthsAvailable[monthIdx];
  const cutoffDate =
    mode === "CAT1"
      ? impDates.cat1Date
      : mode === "CAT2"
        ? impDates.cat2Date
        : mode === "LID"
          ? new Date(
            Math.max(
              impDates.lidLabDate?.getTime?.() || 0,
              impDates.lidTheoryDate?.getTime?.() || 0
            )
          )
          : null;

  const visibleDays = allWorkingDays.filter((d) => {
    if (!d || !d.date) return false;

    const sameMonth = `${d.month} ${d.year}` === currentMonth;
    if (!sameMonth) return false;
    if (cutoffDate && d.date > cutoffDate) return false;
    return true;
  });

  const toggleDate = (date) => {
    const time = date.getTime();

    setDateStates((prev) => {
      const currentState = prev[time] ?? 0;
      const nextState = (currentState + 1) % 3;
      return { ...prev, [time]: nextState };
    });
  };

  const resetSelected = () => setDateStates({});

  const predictions = useMemo(() => {
    return attendanceData
      .filter((c) => c.slotName != "NILL")
      .map((c) => {
        const attended = parseInt(c.attendedClasses);
        const total = parseInt(c.totalClasses);
        const isLab = c.courseCode.endsWith("(L)");

        const filteredDays = allWorkingDays.filter(
          (d) => !cutoffDate || d.date <= cutoffDate
        );

        const { futureCount, ignoredCount } = countFutureClassesForCourse(
          c.courseCode,
          dayCardsMap,
          filteredDays,
          dateStates,
          cutoffDate
        );
        const missed = countMissedClassesForCourse(
          c.courseCode,
          dayCardsMap,
          dateStates,
          filteredDays,
          cutoffDate
        );

        const effectiveFuture = isLab ? futureCount * 2 : futureCount;
        const effectiveMissed = effectiveFuture > 0 ? (isLab ? missed * 2 : missed) : 0;

        const predictedAttended = attended + (effectiveFuture - effectiveMissed);
        const predictedTotal = total + effectiveFuture;
        const predictedPercent = (
          (predictedAttended / predictedTotal) * 100
        ).toFixed(1);

        return { ...c, predictedAttended, predictedTotal, predictedPercent };
      });
  }, [
    dateStates,
    attendanceData,
    allWorkingDays,
    dayCardsMap,
    mode,
    impDates
  ]);

  const totalAttended = predictions.reduce((sum, p) => sum + (parseInt(p.predictedAttended) || 0), 0);
  const totalClasses = predictions.reduce((sum, p) => sum + (parseInt(p.predictedTotal) || 0), 0);

  const overallAvg = totalClasses > 0 ? ((totalAttended / totalClasses) * 100).toFixed(1) : "0.0";

  const buttonOptions = [impDates.cat1Date > new Date() ? "CAT1" : null, impDates.cat2Date > new Date() ? "CAT2" : null, impDates.lidLabDate > new Date() || impDates.lidTheoryDate > new Date() ? "LID" : null].filter(Boolean);

  return (
    <div className="bg-gray-100 dark:bg-slate-800 midnight:bg-black p-5 rounded-2xl shadow-lg transition-all duration-300">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 midnight:text-gray-100 mb-2">
        Overall Attendance Predictor (Beta Feature)
      </h2>

      <div className="flex flex-wrap items-center justify-between mb-4 gap-3">
        <div className="flex items-center gap-2">
          {buttonOptions.map((type) => (
            <Button
              key={type}
              variant={mode === type ? "default" : "outline"}
              size="sm"
              onClick={() => setMode(type)}
              className={`text-xs ${mode === type
                ? "bg-blue-600 text-white dark:bg-blue-700"
                : "bg-gray-200 dark:bg-slate-700 midnight:bg-gray-900 text-gray-700 dark:text-gray-200 midnight:text-gray-200 hover:bg-blue-200 dark:hover:bg-blue-800 midnight:hover:bg-gray-800"
                }`}
            >
              {type === "CAT1"
                ? "Till CAT I"
                : type === "CAT2"
                  ? "Till CAT II"
                  : "Till LID"}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMonthIdx((i) => Math.max(0, i - 1))}
            className="dark:hover:bg-slate-700 midnight:hover:bg-gray-900"
          >
            <ChevronLeft />
          </Button>
          <p className="font-semibold text-gray-800 dark:text-gray-100 midnight:text-gray-100 text-center">
            {currentMonth?.slice(0, -4) || ""}
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setMonthIdx((i) => Math.min(monthsAvailable.length - 1, i + 1))
            }
            className="dark:hover:bg-slate-700 midnight:hover:bg-gray-900"
          >
            <ChevronRight />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={resetSelected}
            className="dark:hover:bg-slate-700 midnight:hover:bg-gray-900"
            title="Reset selections"
          >
            <RotateCcw size={16} />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2 mb-5">
        {visibleDays.map((d, i) => {
          const state = dateStates[d.date.getTime()] ?? 0;
          const formatted = d.date.getDate();
          const weekday = d.date.toLocaleDateString("en-US", { weekday: "short" });
          const isToday = d.date.toDateString() === new Date().toDateString();

          return (
            <div
              key={i}
              onClick={() => toggleDate(d.date)}
              className={`cursor-pointer flex flex-col items-center justify-center gap-1 p-2 rounded-lg text-center font-medium transition-all duration-150
                ${state === 1
                  ? "bg-red-500 text-white scale-105"
                  : state === 2
                    ? "bg-gray-500 text-white opacity-70"
                    : d.date.toDateString() === new Date().toDateString()
                      ? "bg-blue-500 text-white font-bold"
                      : "bg-white dark:bg-slate-900 midnight:bg-gray-950 text-gray-700 dark:text-gray-200 midnight:text-gray-200 hover:bg-blue-100 dark:hover:bg-blue-900/30 midnight:hover:bg-gray-800"
                }`}
            >
              <span className="text-base">{formatted}</span>
              <span
                className={`text-[10px] uppercase ${isToday
                  ? "text-white"
                  : "text-gray-500 dark:text-gray-400 midnight:text-gray-400"
                  }`}
              >
                {weekday}
              </span>
            </div>
          );
        })}
      </div>

      <p className="font-semibold text-center text-blue-600 dark:text-blue-400 midnight:text-blue-400 mb-3">
        Predicted Overall Attendance ({mode}): {overallAvg}%
      </p>

      <div className="max-h-64 overflow-y-auto space-y-2 text-sm rounded-lg bg-white dark:bg-slate-900 midnight:bg-gray-950 p-3 shadow-inner">
        {predictions.map((p, i) => (
          <div
            key={i}
            className="flex justify-between items-center border-b border-gray-300 dark:border-gray-700 midnight:border-gray-800 pb-1"
          >
            <span
              className="text-gray-700 dark:text-gray-200 midnight:text-gray-200 truncate max-w-[70%]"
              title={p.courseTitle}
            >
              <span className="hidden sm:inline">{p.courseTitle}</span>
              <span className="sm:hidden">
                {p.courseTitle.length > 20
                  ? p.courseTitle.slice(0, 20) + "..."
                  : p.courseTitle}
              </span>
            </span>
            <span
              className={`font-semibold ${p.predictedPercent < 75
                ? "text-red-500"
                : p.predictedPercent < 85
                  ? "text-yellow-400"
                  : "text-green-400"
                }`}
            >
              {p.predictedAttended}/{p.predictedTotal} ({p.predictedPercent}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function countFutureClassesForCourse(courseCode, dayCardsMap, allWorkingDays, dateStates, cutoffDate) {
  if (!courseCode || !dayCardsMap || !Array.isArray(allWorkingDays))
    return { futureCount: 0, ignoredCount: 0 };

  const normalizeDay = (d) => d.slice(0, 3).toUpperCase();

  const subjectDays = Object.keys(dayCardsMap).filter((day) =>
    dayCardsMap[day].some((c) => c.courseCode === courseCode)
  );
  if (subjectDays.length === 0)
    return { futureCount: 0, ignoredCount: 0 };

  const subjectDaysShort = subjectDays.map(normalizeDay);

  const dayOrderMap = {
    monday: "MON",
    tuesday: "TUE",
    wednesday: "WED",
    thursday: "THU",
    friday: "FRI",
  };

  const ymd = (d) => {
    const dd = new Date(d);
    dd.setHours(0, 0, 0, 0);
    return `${dd.getFullYear()}-${dd.getMonth() + 1}-${dd.getDate()}`;
  };

  const effectiveMap = new Map();
  for (const d of allWorkingDays) {
    if (!d?.date) continue;
    let effectiveDay = normalizeDay(d.weekday || "");
    if (effectiveDay === "SAT" && Array.isArray(d.events) && d.events.length > 0) {
      const found = d.events.find((ev) =>
        /(monday|tuesday|wednesday|thursday|friday)/i.test(ev.text || ev.category || "")
      );
      if (found) {
        const match = (found.text || found.category || "").match(
          /(Monday|Tuesday|Wednesday|Thursday|Friday)/i
        );
        if (match && match[1]) {
          const mapped = dayOrderMap[match[1].toLowerCase()];
          if (mapped) effectiveDay = mapped;
        }
      }
    }
    effectiveMap.set(ymd(d.date), effectiveDay);
  }

  let ignoredCount = 0;

  for (const [timestamp, state] of Object.entries(dateStates || {})) {
    const s = new Date(parseInt(timestamp));
    if (cutoffDate && s > cutoffDate) continue;
    const key = ymd(s);
    const eff = effectiveMap.get(key);
    if (!eff) continue;
    if (state === 2 && subjectDaysShort.includes(eff)) ignoredCount++;
  }

  const remainingWorkingDays = allWorkingDays.filter((d) => {
    if (!d || !d.date || isNaN(d.date.getTime?.())) return false;
    if (cutoffDate && d.date > cutoffDate) return false;

    let effectiveDay = normalizeDay(d.weekday || "");
    if (effectiveDay === "SAT" && Array.isArray(d.events) && d.events.length > 0) {
      const found = d.events.find((ev) =>
        /(monday|tuesday|wednesday|thursday|friday)/i.test(ev.text || ev.category || "")
      );
      if (found) {
        const match = (found.text || found.category || "").match(
          /(Monday|Tuesday|Wednesday|Thursday|Friday)/i
        );
        if (match && match[1]) {
          const mapped = dayOrderMap[match[1].toLowerCase()];
          if (mapped) effectiveDay = mapped;
        }
      }
    }

    return subjectDaysShort.includes(effectiveDay);
  });

  const futureCount = Math.max(remainingWorkingDays.length - ignoredCount, 0);

  return { futureCount, ignoredCount };
}

function countMissedClassesForCourse(
  courseCode,
  dayCardsMap,
  dateStates,
  allWorkingDays,
  cutoffDate
) {
  if (!courseCode || !dayCardsMap || typeof dateStates !== "object") return 0;

  const normalizeDay = (d) => d.slice(0, 3).toUpperCase();

  const subjectDays = Object.keys(dayCardsMap).filter((day) =>
    dayCardsMap[day].some((c) => c.courseCode === courseCode)
  );
  if (subjectDays.length === 0) return 0;

  const subjectDaysShort = subjectDays.map(normalizeDay);
  const dayOrderMap = {
    monday: "MON",
    tuesday: "TUE",
    wednesday: "WED",
    thursday: "THU",
    friday: "FRI",
  };

  const ymd = (d) => {
    const dd = new Date(d);
    dd.setHours(0, 0, 0, 0);
    return `${dd.getFullYear()}-${dd.getMonth() + 1}-${dd.getDate()}`;
  };

  const effectiveMap = new Map();
  for (const d of allWorkingDays) {
    if (!d?.date) continue;
    let effectiveDay = normalizeDay(d.weekday || "");
    if (effectiveDay === "SAT" && Array.isArray(d.events) && d.events.length > 0) {
      const found = d.events.find((ev) =>
        /(monday|tuesday|wednesday|thursday|friday)/i.test(
          ev.text || ev.category || ""
        )
      );
      if (found) {
        const match = (found.text || found.category || "").match(
          /(Monday|Tuesday|Wednesday|Thursday|Friday)/i
        );
        if (match && match[1]) {
          const mapped = dayOrderMap[match[1].toLowerCase()];
          if (mapped) effectiveDay = mapped;
        }
      }
    }
    effectiveMap.set(ymd(d.date), effectiveDay);
  }

  let missed = 0;

  for (const [timestamp, state] of Object.entries(dateStates)) {
    const s = new Date(parseInt(timestamp));
    const key = ymd(s);
    const eff = effectiveMap.get(key);
    if (!eff) continue;
    if (cutoffDate && s > cutoffDate) continue;

    if (state === 1 && subjectDaysShort.includes(eff)) missed++;
  }
  return missed;
}
