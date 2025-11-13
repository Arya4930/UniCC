import { useState, useEffect } from "react";
import CourseCard from "./courseCard";
import { analyzeAllCalendars } from "@/lib/analyzeCalendar";
import PopupCard from "./PopupCard";
import config from '@/app/config.json'
import NoContentFound from "../NoContentFound";
import OverallAttendancePredictor from "./overallAttendancePredictor";
import { Button } from "@/components/ui/button";
import { Hash, X, BadgeQuestionMark } from "lucide-react";

export default function AttendanceTabs({ data, activeDay, setActiveDay, calendars }) {
  const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
  const [expandedIdx, setExpandedIdx] = useState(null);
  const [showPredictor, setShowPredictor] = useState(false);
  const slotMap = config.slotMap;

  const dayCardsMap = {};
  days.forEach((day) => (dayCardsMap[day] = []));

  data.attendance.forEach((a) => {
    const slots = a.slotName.split("+");
    slots.forEach((slotName) => {
      const cleanSlot = slotName.trim();
      for (const day of days) {
        if (slotMap[day] && slotMap[day][cleanSlot]) {
          const info = slotMap[day][cleanSlot];
          const pct = parseInt(a.attendancePercentage);
          const cleanCourseCode = a.courseCode;
          const cls = pct < 50 ? "low" : pct < 75 ? "medium" : "high";
          dayCardsMap[day].push({
            ...a,
            courseCode: cleanCourseCode,
            slotName: cleanSlot,
            time: info.time,
            cls,
          });
        }
      }
    });
  });

  function parseTime(timeStr) {
    let [h, m] = timeStr.split(":").map(Number);
    if (h < 8) h += 12;
    return h * 60 + m;
  }

  for (const day of days) {
    if (!dayCardsMap[day]) dayCardsMap[day] = [];

    dayCardsMap[day].sort((a, b) => {
      const slotA = a.slotName;
      const slotB = b.slotName;

      const isMorningA = /[A-Z]1$|L([1-2]?[0-9]|30)$/.test(slotA);
      const isMorningB = /[A-Z]1$|L([1-2]?[0-9]|30)$/.test(slotB);

      if (isMorningA && !isMorningB) return -1;
      if (!isMorningA && isMorningB) return 1;
      return slotA.localeCompare(slotB, undefined, { numeric: true });
    });

    const merged = [];
    for (let i = 0; i < dayCardsMap[day].length; i++) {
      const current = dayCardsMap[day][i];
      const next = dayCardsMap[day][i + 1];

      if (
        next &&
        current.courseTitle === next.courseTitle &&
        current.courseType === next.courseType &&
        current.faculty === next.faculty &&
        current.cls === next.cls
      ) {
        const mergedSlotName = `${current.slotName}+${next.slotName}`;
        const mergedSlotTime = `${current.time.split("-")[0]}-${next.time.split("-")[1]}`;
        merged.push({
          ...current,
          slotName: mergedSlotName,
          time: mergedSlotTime,
        });
        i++;
      } else {
        merged.push(current);
      }
    }

    merged.sort((a, b) => {
      const startA = parseTime(a.time.split("-")[0]);
      const startB = parseTime(b.time.split("-")[0]);
      return startA - startB;
    });

    dayCardsMap[day] = merged.length > 0 ? merged : [];
  }

  const daysWithClasses = days.filter((d) => dayCardsMap[d].length > 0);
  const { results, importantEvents } = analyzeAllCalendars(calendars);

  const today = new Date();
  const todayDate = today.getDate();
  const todayMonth =
    today.toLocaleString("default", { month: "long" }).toUpperCase() +
    " " +
    today.getFullYear();

  const monthData = results.find(
    (m) => m.month === todayMonth && m.year === today.getFullYear()
  );

  let isHoliday = false;
  if (monthData) {
    const todayInfo = monthData.days.find((d) => d.date === todayDate);
    if (todayInfo && todayInfo.type === "holiday") {
      isHoliday = true;
    }
  }

  useEffect(() => {
    if (!daysWithClasses.includes(activeDay)) {
      setActiveDay(daysWithClasses[0] || null);
    }
  }, [daysWithClasses]);

  if (daysWithClasses.length === 0) return <NoContentFound />;

  const findEventDate = (eventName) => {
    const ev = [...importantEvents.values()].find(
      (e) => e.event.toLowerCase() === eventName.toLowerCase()
    );
    if (!ev) return null;
    return ev.formattedDate;
  };
  const impDates = {
    cat1Date: findEventDate("CAT I"),
    cat2Date: findEventDate("CAT II"),
    lidLabDate: findEventDate("lid for laboratory classes"),
    lidTheoryDate: findEventDate("LID FOR THEORY CLASSES"),
  };

  return (
    <div className="space-y-6">
      {/* Modern header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="h-1 w-12 bg-gradient-to-r from-transparent to-slate-600 dark:to-slate-400 rounded-full" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 midnight:text-slate-100">
            Weekly Schedule
          </h1>
          <div className="h-1 w-12 bg-gradient-to-l from-transparent to-slate-600 dark:to-slate-400 rounded-full" />
        </div>
        
        <button 
          onClick={() => setShowPredictor(true)} 
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 midnight:bg-gray-900 midnight:hover:bg-gray-800 text-slate-700 dark:text-slate-200 midnight:text-slate-200 font-medium transition-colors text-sm"
        >
          <BadgeQuestionMark className="w-4 h-4" />
          Attendance Predictor
        </button>
      </div>

      {/* Days navigation */}
      <div className="flex gap-2 justify-center flex-wrap px-2">
        {daysWithClasses.map((d) => (
          <button
            key={d}
            onClick={() => setActiveDay(d)}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
              activeDay === d
                ? "bg-slate-700 text-white shadow-lg scale-105 dark:bg-slate-600 midnight:bg-slate-800"
                : "bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 midnight:bg-gray-900 midnight:text-slate-200 midnight:hover:bg-gray-800 border border-slate-200 dark:border-slate-700 midnight:border-gray-800"
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-2">
        {dayCardsMap[activeDay]?.map((a, idx) => (
          <div key={idx}>
            <CourseCard
              a={a}
              onClick={() => setExpandedIdx(idx)}
              activeDay={activeDay}
              isHoliday={isHoliday}
            />
            {expandedIdx === idx && (
              <PopupCard
                a={a}
                setExpandedIdx={setExpandedIdx}
                dayCardsMap={dayCardsMap}
                analyzeCalendars={results}
                impDates={impDates}
              />
            )}
          </div>
        ))}
      </div>

      {/* Predictor modal */}
      {showPredictor && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-50 dark:bg-slate-900 midnight:bg-black rounded-3xl shadow-2xl">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowPredictor(false)}
              className="absolute top-4 right-4 z-10 hover:bg-slate-200 dark:hover:bg-slate-800 midnight:hover:bg-gray-900 rounded-full"
            >
              <X size={22} className="text-slate-700 dark:text-slate-200 midnight:text-slate-200" />
            </Button>

            <OverallAttendancePredictor
              attendanceData={data.attendance}
              analyzeCalendars={results}
              dayCardsMap={dayCardsMap}
              impDates={impDates}
            />
          </div>
        </div>
      )}
    </div>
  );
}
