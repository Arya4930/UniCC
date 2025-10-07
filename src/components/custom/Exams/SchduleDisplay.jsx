"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export default function ExamSchedule({ data }) {
  if (!data) return <p className="text-gray-500 midnight:text-gray-300">No schedule available</p>;

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
      {Object.entries(data.Schedule).map(([examType, subjects]) => {
        const hasCalendarData = subjects.some((s) => s.examSession && s.reportingTime);
        const icsUrl = hasCalendarData ? generateICSFile(subjects, examType) : null;

        return (
          <div
            key={examType}
            className="bg-slate-50 dark:bg-slate-800 midnight:bg-black shadow rounded-2xl p-4 midnight:outline midnight:outline-1 midnight:outline-gray-800"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-blue-700 dark:text-blue-400 midnight:text-white">
                {examType}
              </h2>

              {hasCalendarData && isIOS && (
                <div className="flex gap-2">
                  <a
                    href={icsUrl}
                    download={`${examType}_Schedule_iOS.ics`}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black px-3 py-1.5 rounded-md text-sm font-medium"
                  >
                    Add Exams to Calendar
                  </a>
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              <Table className="bg-transparent">
                <TableHeader>
                  <TableRow>
                    <TableHead className="midnight:text-gray-200">Course Code</TableHead>
                    <TableHead className="midnight:text-gray-200">Course Title</TableHead>
                    <TableHead className="midnight:text-gray-200">Exam Time</TableHead>
                    <TableHead className="midnight:text-gray-200">Venue</TableHead>
                    <TableHead className="midnight:text-gray-200">Seat Location</TableHead>
                    <TableHead className="midnight:text-gray-200">Slot</TableHead>
                    <TableHead className="midnight:text-gray-200">Exam Date</TableHead>
                    <TableHead className="midnight:text-gray-200">Session</TableHead>
                    <TableHead className="midnight:text-gray-200">Reporting Time</TableHead>
                    <TableHead className="midnight:text-gray-200">Seat No</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subjects.map((subj, idx) => {
                    const examDate = parseExamDate(subj.examDate);
                    const isPast = examDate && examDate < today;
                    const isToday =
                      examDate && examDate.getTime() === today.getTime();

                    let rowClass =
                      "odd:bg-slate-100 even:bg-slate-200 dark:odd:bg-slate-700 dark:even:bg-slate-800 midnight:odd:bg-gray-900 midnight:even:bg-gray-800";

                    if (isPast)
                      rowClass +=
                        " opacity-40 line-through hover:opacity-50 cursor-not-allowed";
                    else if (isToday)
                      rowClass +=
                        " !bg-green-100 dark:!bg-green-600/40 midnight:!bg-green-700/50 !text-green-900 dark:!text-green-200";

                    return (
                      <TableRow key={idx} className={rowClass}>
                        <TableCell className="text-center text-slate-900 dark:text-slate-200 midnight:text-gray-100">
                          {subj.courseCode}
                        </TableCell>
                        <TableCell className="text-slate-900 dark:text-slate-200 midnight:text-gray-100">
                          {subj.courseTitle}
                        </TableCell>
                        <TableCell className="text-center text-slate-900 dark:text-slate-200 midnight:text-gray-100">
                          {subj.examTime}
                        </TableCell>
                        <TableCell className="text-center text-slate-900 dark:text-slate-200 midnight:text-gray-100">
                          {subj.venue}
                        </TableCell>
                        <TableCell className="text-center text-slate-900 dark:text-slate-200 midnight:text-gray-100">
                          {subj.seatLocation}
                        </TableCell>
                        <TableCell className="text-center text-slate-900 dark:text-slate-200 midnight:text-gray-100">
                          {subj.slot}
                        </TableCell>
                        <TableCell className="text-center text-slate-900 dark:text-slate-200 midnight:text-gray-100">
                          {subj.examDate}
                        </TableCell>
                        <TableCell className="text-center text-slate-900 dark:text-slate-200 midnight:text-gray-100">
                          {subj.examSession}
                        </TableCell>
                        <TableCell className="text-center text-slate-900 dark:text-slate-200 midnight:text-gray-100">
                          {subj.reportingTime}
                        </TableCell>
                        <TableCell className="text-center text-slate-900 dark:text-slate-200 midnight:text-gray-100">
                          {subj.seatNo}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
