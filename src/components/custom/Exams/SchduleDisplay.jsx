"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function ExamSchedule({ data }) {
  if (!data) return <p className="text-gray-500 midnight:text-gray-300">No schedule available</p>;

  const today = new Date();

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

  return (
    <div className="space-y-6">
      {Object.entries(data.Schedule).map(([examType, subjects]) => (
        <div
          key={examType}
          className="bg-slate-50 dark:bg-slate-800 midnight:bg-black shadow rounded-2xl p-4 midnight:outline midnight:outline-1 midnight:outline-gray-800"
        >
          <h2 className="text-xl font-semibold text-center text-blue-700 dark:text-blue-400 midnight:text-white mb-4">
            {examType}
          </h2>

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
                    examDate &&
                    examDate.getFullYear() === today.getFullYear() &&
                    examDate.getMonth() === today.getMonth() &&
                    examDate.getDate() === today.getDate();

                  let rowClass = "odd:bg-slate-100 even:bg-slate-200 dark:odd:bg-slate-700 dark:even:bg-slate-800 midnight:odd:bg-gray-900 midnight:even:bg-gray-800 transition-all duration-200";

                  if (isPast)
                    rowClass +=
                      " opacity-40 line-through hover:opacity-50 cursor-not-allowed";
                  else if (isToday)
                    rowClass +=
                      " bg-green-100 dark:bg-green-900/40 midnight:bg-green-950/50 border-l-4 border-green-500 shadow-sm";

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
      ))}
    </div>
  );
}
