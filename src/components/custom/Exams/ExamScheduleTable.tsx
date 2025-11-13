"use client";

interface ExamScheduleEntry {
  courseCode: string;
  courseName: string;
  slot: string;
  examDate: string;
  session: string;
  venue: string;
  seatNumber: string;
}

interface ExamScheduleTableProps {
  schedule: ExamScheduleEntry[];
}

export default function ExamScheduleTable({ schedule }: ExamScheduleTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700 midnight:border-gray-800">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 dark:bg-slate-800 midnight:bg-gray-900">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-slate-300 midnight:text-slate-200">
              Course Code
            </th>
            <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-slate-300 midnight:text-slate-200">
              Course Name
            </th>
            <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-slate-300 midnight:text-slate-200">
              Slot
            </th>
            <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-slate-300 midnight:text-slate-200">
              Exam Date
            </th>
            <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-slate-300 midnight:text-slate-200">
              Session
            </th>
            <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-slate-300 midnight:text-slate-200">
              Venue
            </th>
            <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-slate-300 midnight:text-slate-200">
              Seat
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-700 midnight:divide-gray-800">
          {schedule.map((exam, index) => (
            <tr
              key={index}
              className="hover:bg-slate-50 dark:hover:bg-slate-800 midnight:hover:bg-gray-900 transition-colors"
            >
              <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100 midnight:text-slate-50">
                {exam.courseCode}
              </td>
              <td className="px-4 py-3 text-slate-600 dark:text-slate-400 midnight:text-slate-300">
                {exam.courseName}
              </td>
              <td className="px-4 py-3 text-slate-600 dark:text-slate-400 midnight:text-slate-300">
                {exam.slot}
              </td>
              <td className="px-4 py-3 text-slate-600 dark:text-slate-400 midnight:text-slate-300">
                {exam.examDate}
              </td>
              <td className="px-4 py-3 text-slate-600 dark:text-slate-400 midnight:text-slate-300">
                {exam.session}
              </td>
              <td className="px-4 py-3 text-slate-600 dark:text-slate-400 midnight:text-slate-300">
                {exam.venue}
              </td>
              <td className="px-4 py-3 text-slate-600 dark:text-slate-400 midnight:text-slate-300">
                {exam.seatNumber}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
