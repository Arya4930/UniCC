import { useState, useEffect } from "react";
import CourseCard from "./courseCard";
import { analyzeAllCalendars } from "@/lib/analyzeCalendar";
import PopupCard from "./PopupCard";
import config from '@/app/config.json'
import NoContentFound from "../NoContentFound";

export default function AttendanceTabs({ data, activeDay, setActiveDay, calendars, is9Pointer }) {
  const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
  const [expandedIdx, setExpandedIdx] = useState(null);
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
        const mergedSlotTime = `${current.time.split("-")[0]}-${next.time.split("-")[1]
          }`;
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
  const todayMonth = today.toLocaleString("default", { month: "long" }).toUpperCase() + " " + today.getFullYear();

  const monthData = results.find(m => m.month === todayMonth && m.year === today.getFullYear());

  let isHoliday = false;
  if (monthData) {
    const todayInfo = monthData.days.find(d => d.date === todayDate);
    if (todayInfo && todayInfo.type === "holiday") {
      isHoliday = true;
    }
  }

  useEffect(() => {
    if (!daysWithClasses.includes(activeDay)) {
      setActiveDay(daysWithClasses[0] || null);
    }
  }, [daysWithClasses]);

  if (daysWithClasses.length === 0)
    return <NoContentFound  />

  return (
    <div className="grid gap-4">
      <h1 className="text-lg font-semibold mb-3 text-center text-gray-800 dark:text-gray-100 midnight:text-gray-100">
        Weekly Attendance
      </h1>

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
            />
            {expandedIdx === idx && (
              <PopupCard
                a={a}
                setExpandedIdx={setExpandedIdx}
                activeDay={activeDay}
                dayCardsMap={dayCardsMap}
                analyzeCalendars={results}
                importantEvents={importantEvents}
                is9Pointer={is9Pointer}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
