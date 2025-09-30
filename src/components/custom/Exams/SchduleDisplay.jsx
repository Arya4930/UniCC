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
  if (!data) return <p className="text-gray-500">No schedule available</p>;

  return (
    <div className="space-y-6">
      {Object.entries(data.Schedule).map(([examType, subjects]) => (
        <div
          key={examType}
          className="bg-slate-50 dark:bg-slate-800 shadow rounded-2xl p-4"
        >
          <h2 className="text-xl font-semibold text-blue-700 dark:text-blue-400 mb-4">
            {examType}
          </h2>

          <div className="overflow-x-auto">
            <Table className="bg-transparent">
              <TableHeader>
                <TableRow>
                  <TableHead>Course Code</TableHead>
                  <TableHead>Course Title</TableHead>
                  <TableHead>Exam Time</TableHead>
                  <TableHead>Venue</TableHead>
                  <TableHead>Seat Location</TableHead>
                  <TableHead>Slot</TableHead>
                  <TableHead>Exam Date</TableHead>
                  <TableHead>Session</TableHead>
                  <TableHead>Reporting Time</TableHead>
                  <TableHead>Seat No</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subjects.map((subj, idx) => (
                  <TableRow
                    key={idx}
                    className="odd:bg-slate-100 even:bg-slate-200 dark:odd:bg-slate-700 dark:even:bg-slate-800"
                  >
                    <TableCell className="text-center text-slate-900 dark:text-slate-200">
                      {subj.courseCode}
                    </TableCell>
                    <TableCell className="text-slate-900 dark:text-slate-200">
                      {subj.courseTitle}
                    </TableCell>
                    <TableCell className="text-center text-slate-900 dark:text-slate-200">
                      {subj.examTime}
                    </TableCell>
                    <TableCell className="text-center text-slate-900 dark:text-slate-200">
                      {subj.venue}
                    </TableCell>
                    <TableCell className="text-center text-slate-900 dark:text-slate-200">
                      {subj.seatLocation}
                    </TableCell>
                    <TableCell className="text-center text-slate-900 dark:text-slate-200">
                      {subj.slot}
                    </TableCell>
                    <TableCell className="text-center text-slate-900 dark:text-slate-200">
                      {subj.examDate}
                    </TableCell>
                    <TableCell className="text-center text-slate-900 dark:text-slate-200">
                      {subj.examSession}
                    </TableCell>
                    <TableCell className="text-center text-slate-900 dark:text-slate-200">
                      {subj.reportingTime}
                    </TableCell>
                    <TableCell className="text-center text-slate-900 dark:text-slate-200">
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
