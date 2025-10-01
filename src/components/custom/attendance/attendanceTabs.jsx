import { useState } from "react";
import CourseCard from "./courseCard";

const slotMap = {
  MON: {
    A1: { time: "8:00-8:50" }, F1: { time: "8:55-9:45" }, D1: { time: "9:50-10:40" },
    TB1: { time: "10:45-11:35" }, TG1: { time: "11:40-12:30" }, S11: { time: "12:35-1:25" },
    A2: { time: "2:00-2:50" }, F2: { time: "2:55-3:45" }, D2: { time: "3:50-4:40" },
    TB2: { time: "4:45-5:35" }, TG2: { time: "5:40-6:30" }, S3: { time: "6:35-7:25" },
    L1: { time: "8:00-8:50" }, L2: { time: "8:50-9:40" }, L3: { time: "9:50-10:40" },
    L4: { time: "10:40-11:30" }, L5: { time: "11:40-12:30" }, L6: { time: "12:30-1:20" },
    L31: { time: "2:00-2:50" }, L32: { time: "2:50-3:40" }, L33: { time: "3:50-4:40" },
    L34: { time: "4:40-5:30" }, L35: { time: "5:40-6:30" }, L36: { time: "6:30-7:20" }
  },
  TUE: {
    B1: { time: "8:00-8:50" }, G1: { time: "8:55-9:45" }, E1: { time: "9:50-10:40" },
    TC1: { time: "10:45-11:35" }, TAA1: { time: "11:40-12:30" }, L12: { time: "12:35-1:25" },
    B2: { time: "2:00-2:50" }, G2: { time: "2:55-3:45" }, E2: { time: "3:50-4:40" },
    TC2: { time: "4:45-5:35" }, TAA2: { time: "5:40-6:30" }, S1: { time: "6:35-7:25" },
    L7: { time: "8:00-8:50" }, L8: { time: "8:50-9:40" }, L9: { time: "9:50-10:40" },
    L10: { time: "10:40-11:30" }, L11: { time: "11:40-12:30" }, L37: { time: "2:00-2:50" },
    L38: { time: "2:50-3:40" }, L39: { time: "3:50-4:40" }, L40: { time: "4:40-5:30" },
    L41: { time: "5:40-6:30" }, L42: { time: "6:30-7:20" }
  },
  WED: {
    C1: { time: "8:00-8:50" }, A1: { time: "8:55-9:45" }, F1: { time: "9:50-10:40" },
    TD1: { time: "10:45-11:35" }, TBB1: { time: "11:40-12:30" }, L18: { time: "12:35-1:25" },
    C2: { time: "2:00-2:50" }, A2: { time: "2:55-3:45" }, F2: { time: "3:50-4:40" },
    TD2: { time: "4:45-5:35" }, TBB2: { time: "5:40-6:30" }, S4: { time: "6:35-7:25" },
    L12: { time: "8:00-8:50" }, L13: { time: "8:50-9:40" }, L14: { time: "9:50-10:40" },
    L15: { time: "10:40-11:30" }, L17: { time: "11:40-12:30" }, L43: { time: "2:00-2:50" },
    L44: { time: "2:50-3:40" }, L45: { time: "3:50-4:40" }, L46: { time: "4:40-5:30" },
    L47: { time: "5:40-6:30" }, L48: { time: "6:30-7:20" }
  },
  THU: {
    D1: { time: "8:00-8:50" }, B1: { time: "8:55-9:45" }, G1: { time: "9:50-10:40" },
    TE1: { time: "10:45-11:35" }, TCC1: { time: "11:40-12:30" }, L24: { time: "12:35-1:25" },
    D2: { time: "2:00-2:50" }, B2: { time: "2:55-3:45" }, G2: { time: "3:50-4:40" },
    TE2: { time: "4:45-5:35" }, TCC2: { time: "5:40-6:30" }, S2: { time: "6:35-7:25" },
    L19: { time: "8:00-8:50" }, L20: { time: "8:50-9:40" }, L21: { time: "9:50-10:40" },
    L22: { time: "10:40-11:30" }, L23: { time: "11:40-12:30" }, L49: { time: "2:00-2:50" },
    L50: { time: "2:50-3:40" }, L51: { time: "3:50-4:40" }, L52: { time: "4:40-5:30" },
    L53: { time: "5:40-6:30" }, L54: { time: "6:30-7:20" }
  },
  FRI: {
    E1: { time: "8:00-8:50" }, C1: { time: "8:55-9:45" }, TA1: { time: "9:50-10:40" },
    TF1: { time: "10:45-11:35" }, TDD1: { time: "11:40-12:30" }, S15: { time: "12:35-1:25" },
    E2: { time: "2:00-2:50" }, C2: { time: "2:55-3:45" }, TA2: { time: "3:50-4:40" },
    TF2: { time: "4:45-5:35" }, TDD2: { time: "5:40-6:30" }, L60: { time: "6:35-7:25" },
    L25: { time: "8:00-8:50" }, L26: { time: "8:50-9:40" }, L27: { time: "9:50-10:40" },
    L28: { time: "10:40-11:30" }, L29: { time: "11:40-12:30" }, L30: { time: "12:30-1:20" },
    L55: { time: "2:00-2:50" }, L56: { time: "2:50-3:40" }, L57: { time: "3:50-4:40" },
    L58: { time: "4:40-5:30" }, L59: { time: "5:40-6:30" }
  }
};

export default function AttendanceTabs({ data, activeDay, setActiveDay }) {
  const days = ["MON", "TUE", "WED", "THU", "FRI"];
  const [expandedIdx, setExpandedIdx] = useState(null);

  const dayCardsMap = {};
  days.forEach(day => (dayCardsMap[day] = []));

  // 1. Build structured data
  data.attendance.forEach(a => {
    const slots = a.slotName.split("+");
    slots.forEach(slotName => {
      const cleanSlot = slotName.trim();
      for (const day of days) {
        if (slotMap[day] && slotMap[day][cleanSlot]) {
          const info = slotMap[day][cleanSlot];
          const pct = parseInt(a.attendancePercentage);
          const cls = pct < 50 ? "low" : pct < 75 ? "medium" : "high";

          dayCardsMap[day].push({
            ...a,
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
        merged.push({ ...current, slotName: mergedSlotName, time: mergedSlotTime });
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


  return (
    <div className="grid gap-4">
      <h1 className="text-lg font-semibold mb-3 text-center text-gray-800 dark:text-gray-100 midnight:text-gray-100">
        Weekly Attendance
      </h1>

      <div className="flex gap-2 mb-3 justify-center flex-wrap">
        {days.map((d) => (
          <button
            key={d}
            onClick={() => setActiveDay(d)}
            className={`px-4 py-2 rounded-md text-sm md:text-base font-medium transition-colors duration-150
          ${activeDay === d
                ? "bg-blue-600 text-white midnight:bg-blue-700"
                : "bg-gray-200 text-gray-700 hover:bg-blue-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 midnight:bg-black midnight:text-gray-200 midnight:hover:bg-gray-800"
              }`}
          >
            {d}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {dayCardsMap[activeDay].map((a, idx) => (
          <div key={idx}>
            <CourseCard
              a={a}
              onClick={() => setExpandedIdx(idx)}
              activeDay={activeDay}
              className="p-2 text-sm rounded-md shadow-sm bg-gray-100 dark:bg-gray-800 midnight:bg-black hover:shadow-md transition"
            />

            {expandedIdx === idx && (
              <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                <div className="bg-gray-100 dark:bg-gray-800 midnight:bg-black rounded-xl shadow-lg p-4 max-w-sm w-[90%] relative">
                  <h2 className="text-base font-semibold mb-2 text-gray-900 dark:text-gray-100 midnight:text-gray-100">
                    {a.courseTitle}
                  </h2>
                  <ul className="list-disc list-inside text-xs max-h-[70vh] overflow-y-auto space-y-1">
                    {a.viewLink?.map((d, i) => (
                      <li
                        key={i}
                        className={`${d.status.toLowerCase() === "absent"
                            ? "text-red-500"
                            : d.status.toLowerCase() === "present"
                              ? "text-green-500"
                              : d.status.toLowerCase() === "on duty"
                                ? "text-yellow-500"
                                : "text-gray-700 dark:text-gray-300 midnight:text-gray-300"
                          }`}
                      >
                        {d.date} – {d.status}
                      </li>
                    ))}
                  </ul>
                  <button
                    className="absolute top-2 right-2 text-gray-700 dark:text-gray-200 midnight:text-gray-200 hover:text-gray-500 dark:hover:text-gray-400 midnight:hover:text-gray-400"
                    onClick={() => setExpandedIdx(null)}
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
