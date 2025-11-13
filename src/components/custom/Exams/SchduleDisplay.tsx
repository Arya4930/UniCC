"use client";

import { Button } from "@/components/ui/button";
import NoContentFound from "../NoContentFound";
import { RefreshCcw, Calendar } from "lucide-react";

export default function ExamSchedule({ data, handleScheduleFetch }) {
  if (!data) {
    return (
      <div>
        <p className="text-center text-gray-600 dark:text-gray-300 midnight:text-gray-200">
          No Exam Schedule Available.{" "}
          <button onClick={handleScheduleFetch} className="mt-2 px-4 py-2 rounded-lg bg-slate-600 hover:bg-slate-700 text-white font-medium transition-colors">
            <RefreshCcw className={`w-4 h-4`} />
          </button>
        </p>
        <NoContentFound />
      </div>
    );
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isIOS =
    typeof navigator !== "undefined" &&
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !window.MSStream;


  const parseExamDate = (dateStr) => {
    if (!dateStr) return null;
    const parts = dateStr.split(/[-/]/);
    if (parts.length === 3) {
      let [d, m, y] = parts;
      d = parseInt(d);
      if (isNaN(d)) return null;

      if (isNaN(m)) {
        const monthNames = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
        const mIndex = monthNames.findIndex((x) => x === m.toLowerCase().slice(0, 3));
        if (mIndex === -1) return null;
        return new Date(y, mIndex, d);
      } else {
        return new Date(y, m - 1, d);
      }
    }
    return new Date(dateStr);
  };

  function computeExamTimes(reportingTimeStr, examDateStr, examType) {
    if (!reportingTimeStr || !examDateStr) return {};

    const [day, monthStr, year] = examDateStr.split(/[-/]/);
    const monthNames = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
    const month = monthNames.findIndex(m => monthStr.toLowerCase().startsWith(m));

    const [hours, minutes, meridian] = reportingTimeStr.match(/(\d+):(\d+)\s*(AM|PM)/i).slice(1);
    let h = parseInt(hours);
    let m = parseInt(minutes);
    if (meridian.toUpperCase() === "PM" && h !== 12) h += 12;
    if (meridian.toUpperCase() === "AM" && h === 12) h = 0;

    const start = new Date(year, month, day, h, m);

    const duration =
      examType.toUpperCase().includes("CAT") ? 1 * 60 + 45 :
        examType.toUpperCase().includes("FAT") ? 3 * 60 + 30 :
          0;

    const end = new Date(start.getTime() + duration * 60000);

    const fmt = (d) =>
      d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

    return {
      startUTC: fmt(start),
      endUTC: fmt(end),
    };
  }


  const generateICSFile = (subjects, examType) => {
    const events = subjects
      .filter((s) => s.reportingTime && s.examSession)
      .map((subj) => {
        const { startUTC, endUTC } = computeExamTimes(subj.reportingTime, subj.examDate, examType);
        const uid = crypto.randomUUID();
        const dtstamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

        return [
          "BEGIN:VEVENT",
          `SUMMARY:${subj.courseTitle} (${examType})`,
          `DESCRIPTION:${subj.courseCode} — ${subj.reportingTime} @ ${subj.venue == "-" ? "TBA" : subj.venue}`,
          `LOCATION:${subj.venue == "-" ? "TBA" : subj.venue}`,
          `UID:${uid}`,
          `DTSTAMP:${dtstamp}`,
          `DTSTART:${startUTC}`,
          `DTEND:${endUTC}`,
          "END:VEVENT",
        ].join("\n");
      })
      .join("\n\n");

    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Uni CC//Schedule Export//EN",
      events,
      "END:VCALENDAR",
    ].join("\n");


    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    return URL.createObjectURL(blob);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold mb-4 text-center text-slate-900 dark:text-slate-100 midnight:text-slate-100">
        Exam Schedule 
        <button onClick={handleScheduleFetch} className="ml-3 px-4 py-2 rounded-lg bg-slate-600 hover:bg-slate-700 text-white font-medium transition-colors">
          <RefreshCcw className="w-4 h-4" />
        </button>
      </h1>
      
      {Object.entries(data.Schedule).map(([examType, subjects]) => {
        const hasCalendarData = subjects.some((s) => s.examSession && s.reportingTime);
        const icsUrl = hasCalendarData ? generateICSFile(subjects, examType) : null;

        return (
          <div key={examType} className="space-y-4">
            <div className="flex items-center justify-between mb-4 px-2">
              <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300 midnight:text-slate-200">
                {examType}
              </h2>

              {hasCalendarData && isIOS && (
                <a
                  href={icsUrl}
                  download={`${examType}_Schedule_iOS.ics`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium transition-colors"
                >
                  <Calendar className="w-4 h-4" />
                  Add to Calendar
                </a>
              )}
            </div>

            <div data-scrollable className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 midnight:border-gray-800">
              <table className="w-full text-sm">
                <thead className="bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 midnight:from-gray-900 midnight:to-black">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300 midnight:text-slate-200 whitespace-nowrap">
                      Course Code
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300 midnight:text-slate-200">
                      Course Title
                    </th>
                    <th className="px-4 py-3 text-center font-semibold text-slate-700 dark:text-slate-300 midnight:text-slate-200 whitespace-nowrap">
                      Slot
                    </th>
                    <th className="px-4 py-3 text-center font-semibold text-slate-700 dark:text-slate-300 midnight:text-slate-200 whitespace-nowrap">
                      Exam Date
                    </th>
                    <th className="px-4 py-3 text-center font-semibold text-slate-700 dark:text-slate-300 midnight:text-slate-200 whitespace-nowrap">
                      Exam Time
                    </th>
                    <th className="px-4 py-3 text-center font-semibold text-slate-700 dark:text-slate-300 midnight:text-slate-200 whitespace-nowrap">
                      Venue
                    </th>
                    <th className="px-4 py-3 text-center font-semibold text-slate-700 dark:text-slate-300 midnight:text-slate-200 whitespace-nowrap">
                      Seat Location
                    </th>
                    <th className="px-4 py-3 text-center font-semibold text-slate-700 dark:text-slate-300 midnight:text-slate-200 whitespace-nowrap">
                      Seat No
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700 midnight:divide-gray-800">
                  {subjects.map((subj, idx) => {
                    const examDate = parseExamDate(subj.examDate);
                    const isPast = examDate && examDate < today;
                    const isToday = examDate && examDate.getTime() === today.getTime();

                    let rowClass = "transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 midnight:hover:bg-gray-900";
                    
                    if (isPast) {
                      rowClass += " opacity-40 line-through";
                    } else if (isToday) {
                      rowClass = "bg-green-50 dark:bg-green-950/30 midnight:bg-green-950/20 hover:bg-green-100 dark:hover:bg-green-950/40 midnight:hover:bg-green-950/30";
                    }

                    return (
                      <tr key={idx} className={rowClass}>
                        <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200 midnight:text-slate-200 whitespace-nowrap">
                          {subj.courseCode}
                        </td>
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300 midnight:text-slate-300">
                          {subj.courseTitle}
                        </td>
                        <td className="px-4 py-3 text-center text-slate-700 dark:text-slate-300 midnight:text-slate-300">
                          {subj.slot}
                        </td>
                        <td className="px-4 py-3 text-center text-slate-700 dark:text-slate-300 midnight:text-slate-300 whitespace-nowrap">
                          {subj.examDate}
                        </td>
                        <td className="px-4 py-3 text-center text-slate-700 dark:text-slate-300 midnight:text-slate-300 whitespace-nowrap">
                          {subj.examTime || subj.reportingTime}
                        </td>
                        <td className="px-4 py-3 text-center text-slate-700 dark:text-slate-300 midnight:text-slate-300">
                          {subj.venue}
                        </td>
                        <td className="px-4 py-3 text-center text-slate-700 dark:text-slate-300 midnight:text-slate-300">
                          {subj.seatLocation}
                        </td>
                        <td className="px-4 py-3 text-center font-semibold text-slate-800 dark:text-slate-200 midnight:text-slate-200">
                          {subj.seatNo}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
