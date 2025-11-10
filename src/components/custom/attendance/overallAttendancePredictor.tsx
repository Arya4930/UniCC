"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";

export default function OverallAttendancePredictor({
  attendanceData,
  analyzeCalendars,
  dayCardsMap,
  importantEvents,
}) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);
  const [selectedDates, setSelectedDates] = useState([]);
  const [mode, setMode] = useState("LID");

  const findEventDate = (eventName) => {
    const ev = [...importantEvents.values()].find(
      (e) => e.event.toLowerCase() === eventName.toLowerCase()
    );
    if (!ev) return null;
    return new Date(ev.formattedDate);
  };

  const CAT1Date = findEventDate("CAT I");
  const CAT2Date = findEventDate("CAT II");
  const LIDDate = findEventDate("lid for laboratory classes");

  const allWorkingDays = useMemo(() => {
    if (!Array.isArray(analyzeCalendars)) return [];

    const monthNames = [
      "january",
      "february",
      "march",
      "april",
      "may",
      "june",
      "july",
      "august",
      "september",
      "october",
      "november",
      "december",
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

          if (mode === "CAT1" && CAT1Date && dateObj > CAT1Date) return null;
          if (mode === "CAT2" && CAT2Date && dateObj > CAT2Date) return null;
          if (mode === "LID" && LIDDate && dateObj > LIDDate) return null;

          return {
            date: dateObj,
            weekday: d.weekday,
            month: monthObj.month,
            year: monthObj.year,
          };
        })
        .filter(Boolean);
    });
  }, [analyzeCalendars, mode]);

  const [monthIdx, setMonthIdx] = useState(0);
  const monthsAvailable = Array.from(
    new Set(allWorkingDays.map((d) => `${d.month} ${d.year}`))
  );
  const currentMonth = monthsAvailable[monthIdx];
  const visibleDays = allWorkingDays.filter(
    (d) => `${d.month} ${d.year}` === currentMonth
  );

  const toggleDate = (date) => {
    const time = date.getTime();
    setSelectedDates((prev) =>
      prev.some((d) => d.getTime() === time)
        ? prev.filter((d) => d.getTime() !== time)
        : [...prev, date]
    );
  };

  const resetSelected = () => setSelectedDates([]);

  const predictions = useMemo(() => {
    return attendanceData
      .filter((c) => c.totalClasses && c.attendedClasses)
      .map((c) => {
        const attended = parseInt(c.attendedClasses);
        const total = parseInt(c.totalClasses);
        const futureClasses = countFutureClassesForCourse(
          c.courseCode,
          dayCardsMap,
          allWorkingDays
        );
        const missed = countMissedClassesForCourse(
          c.courseCode,
          dayCardsMap,
          selectedDates
        );

        const predictedAttended = attended + (futureClasses - missed);
        const predictedTotal = total + futureClasses;
        const predictedPercent = (
          (predictedAttended / predictedTotal) *
          100
        ).toFixed(1);

        return { ...c, predictedAttended, predictedTotal, predictedPercent };
      });
  }, [selectedDates, attendanceData, allWorkingDays, dayCardsMap]);

  const overallAvg = (
    predictions.reduce((sum, p) => sum + parseFloat(p.predictedPercent), 0) /
    (predictions.length || 1)
  ).toFixed(1);

  return (
    <div className="bg-gray-100 dark:bg-slate-800 midnight:bg-black p-5 rounded-2xl shadow-lg transition-all duration-300">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 midnight:text-gray-100 mb-2">Overall Attendance Predictor (Beta Feature)</h2>
      <div className="flex flex-wrap items-center justify-between mb-4 gap-3">
        <div className="flex items-center gap-2">
          {["CAT1", "CAT2", "LID"].map((type) => (
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

      <div className="grid grid-cols-7 gap-2 mb-5">
        {visibleDays.map((d, i) => {
          const isSelected = selectedDates.some(
            (s) => s.getTime() === d.date.getTime()
          );
          const formatted = d.date.getDate();
          const isToday = d.date.toDateString() === new Date().toDateString();

          return (
            <div
              key={i}
              onClick={() => toggleDate(d.date)}
              className={`cursor-pointer p-2 rounded-lg text-center font-medium transition-all duration-150
                ${isSelected
                  ? "bg-red-500 text-white scale-105"
                  : isToday
                    ? "bg-blue-500 text-white font-bold"
                    : "bg-white dark:bg-slate-900 midnight:bg-gray-950 text-gray-700 dark:text-gray-200 midnight:text-gray-200 hover:bg-blue-100 dark:hover:bg-blue-900/30 midnight:hover:bg-gray-800"
                }`}
            >
              {formatted}
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

/* Helper Functions */
function normalizeDay(d) {
  return d.slice(0, 3).toUpperCase();
}

function countFutureClassesForCourse(courseCode, dayCardsMap, allWorkingDays) {
  const subjectDays = Object.keys(dayCardsMap).filter((day) =>
    dayCardsMap[day].some((c) => c.courseCode === courseCode)
  );
  return allWorkingDays.filter((d) =>
    subjectDays.includes(normalizeDay(d.weekday || ""))
  ).length;
}

function countMissedClassesForCourse(courseCode, dayCardsMap, selectedDates) {
  const subjectDays = Object.keys(dayCardsMap).filter((day) =>
    dayCardsMap[day].some((c) => c.courseCode === courseCode)
  );
  return selectedDates.filter((date) => {
    const weekday = normalizeDay(
      date.toLocaleDateString("en-US", { weekday: "short" })
    );
    return subjectDays.includes(weekday);
  }).length;
}
