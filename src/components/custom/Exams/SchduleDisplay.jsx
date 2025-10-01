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

  return (
    <div className="space-y-6">
      {Object.entries(data.Schedule).map(([examType, subjects]) => (
        <div
          key={examType}
          className="bg-slate-50 dark:bg-slate-800 midnight:bg-black shadow rounded-2xl p-4 midnight:outline midnight:outline-1 midnight:outline-gray-800"
        >
          <h2 className="text-xl font-semibold text-blue-700 dark:text-blue-400 midnight:text-blue-300 mb-4">
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
                {subjects.map((subj, idx) => (
                  <TableRow
                    key={idx}
                    className="odd:bg-slate-100 even:bg-slate-200 dark:odd:bg-slate-700 dark:even:bg-slate-800 midnight:odd:bg-gray-900 midnight:even:bg-gray-800"
                  >
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
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ))}
    </div>
  );
}
