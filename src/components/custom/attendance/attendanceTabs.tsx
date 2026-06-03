import { useState, useEffect } from "react";
import CourseCard from "./courseCard";
import { analyzeAllCalendars } from "@/lib/analyzeCalendar";
import PopupCard from "./PopupCard";
import config from '../../../../config.json';
import NoContentFound from "../NoContentFound";
import OverallAttendancePredictor from "./overallAttendancePredictor";
import { Button } from "@/components/ui/button";
import { X, BadgeQuestionMark, Calendar } from "lucide-react";
import TimetableGrid from "./TimetableGrid";

export default function AttendanceTabs({ data, activeDay, setActiveDay, calendars, decimalValues }) {
  const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
  const [expandedIdx, setExpandedIdx] = useState(null);
  const [showPredictor, setShowPredictor] = useState(false);
  const [showTimetable, setShowTimetable] = useState(false);
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
    let [h, m] = timeStr.trim().split(":").map(Number);
    if (h < 8) h += 12;
    return h * 60 + m;
  }

  function getTimeRange(time) {
    const [start, end] = time.split("-").map((t) => t.trim());
    return {
      start: parseTime(start),
      end: parseTime(end),
    };
  }

  for (const day of days) {
    if (!dayCardsMap[day]) dayCardsMap[day] = [];

    dayCardsMap[day].sort((a, b) => {
      const timeA = getTimeRange(a.time);
      const timeB = getTimeRange(b.time);
      if (timeA.start !== timeB.start) return timeA.start - timeB.start;
      return a.slotName.localeCompare(b.slotName, undefined, { numeric: true });
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
        const currentRange = getTimeRange(current.time);
        const nextRange = getTimeRange(next.time);
        const gapInMinutes = nextRange.start - currentRange.end;

        if (gapInMinutes >= 0 && gapInMinutes <= 5) {
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
    midsemStart: findEventDate("Mid Term Test"),
  };

  if (daysWithClasses.length === 0) return <NoContentFound />;

  return (
    <div className="grid gap-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
        {/* Mobile View: Inline Center */}
        <h1 className="md:hidden text-xl font-bold text-center text-gray-900 dark:text-gray-100 midnight:text-gray-100">
          <button onClick={() => setShowTimetable(true)} className="inline-flex mr-2 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors align-middle">
            <Calendar className={`w-4 h-4`} />
          </button>
          Weekly Attendance
          <button onClick={() => setShowPredictor(true)} className="inline-flex ml-2 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors align-middle">
            <BadgeQuestionMark className={`w-4 h-4`} />
          </button>
        </h1>

        {/* Desktop View: Left Aligned Heading + Right Aligned Buttons */}
        <h1 className="hidden md:block text-3xl font-bold text-left text-gray-900 dark:text-gray-100 midnight:text-gray-100">
          Weekly Attendance
        </h1>
        <div className="hidden md:flex items-center gap-3">
          <button onClick={() => setShowTimetable(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors shadow-sm">
            <Calendar className={`w-4 h-4`} /> <span className="text-sm">Timetable</span>
          </button>
          <button onClick={() => setShowPredictor(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors shadow-sm">
            <BadgeQuestionMark className={`w-4 h-4`} /> <span className="text-sm">Predictor</span>
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-3 justify-center flex-wrap">
        {daysWithClasses.map((d) => (
          <button
            key={d}
            onClick={() => setActiveDay(d)}
            className={`px-4 py-2 rounded-md text-sm md:text-base font-medium transition-colors duration-150
              ${activeDay === d
                ? "bg-blue-600 text-white midnight:bg-blue-700"
                : "bg-gray-200 text-gray-700 hover:bg-blue-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 midnight:bg-black midnight:text-gray-200 midnight:hover:bg-gray-800 midnight:outline midnight:outline-1 midnight:outline-gray-800"
              }`}
          >
            {d}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-2">
        {dayCardsMap[activeDay]?.map((a, idx) => (
          <div key={idx}>
            <CourseCard
              a={a}
              onClick={() => setExpandedIdx(idx)}
              activeDay={activeDay}
              isHoliday={isHoliday}
              decimalValues={decimalValues}
            />
            {expandedIdx === idx && (
              <PopupCard
                a={a}
                setExpandedIdx={setExpandedIdx}
                dayCardsMap={dayCardsMap}
                analyzeCalendars={results}
                impDates={impDates}
                decimalValues={decimalValues}
              />
            )}
          </div>
        ))}
      </div>

      {showPredictor && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-center items-center">
          <div className="relative w-[95%] max-w-4xl max-h-[95vh] overflow-y-auto bg-gray-100 dark:bg-slate-800 midnight:bg-black rounded-2xl shadow-2xl p-5">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowPredictor(false)}
              className="absolute top-3 right-3 hover:bg-gray-200 dark:hover:bg-slate-700 midnight:hover:bg-gray-900"
            >
              <X size={22} className="text-gray-700 dark:text-gray-200 midnight:text-gray-200" />
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
      {showTimetable && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-center items-center">
          <div className="relative w-[95%] max-h-[95vh] overflow-y-auto bg-gray-100 dark:bg-slate-800 midnight:bg-black rounded-2xl shadow-2xl p-5">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowTimetable(false)}
              className="absolute top-3 right-3 hover:bg-gray-200 dark:hover:bg-slate-700 midnight:hover:bg-gray-900"
            >
              <X size={22} className="text-gray-700 dark:text-gray-200 midnight:text-gray-200" />
            </Button>

            <TimetableGrid attendance={data.attendance} />
          </div>
        </div>
      )}
    </div>
  );
}
