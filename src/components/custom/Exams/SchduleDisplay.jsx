"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function ExamSchedule({ data }) {
  if (!data) return <p className="text-gray-500">No schedule available</p>;

  return (
    <div className="space-y-6">
      {Object.entries(data.Schedule).map(([examType, subjects]) => (
        <div key={examType} className="bg-white shadow rounded-2xl p-4">
          <h2 className="text-xl font-semibold text-blue-700 mb-4">{examType}</h2>

          <div className="overflow-x-auto">
            <Table>
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
                  <TableRow key={idx}>
                    <TableCell className="text-center">{subj.courseCode}</TableCell>
                    <TableCell>{subj.courseTitle}</TableCell>
                    <TableCell className="text-center">{subj.examTime}</TableCell>
                    <TableCell className="text-center">{subj.venue}</TableCell>
                    <TableCell className="text-center">{subj.seatLocation}</TableCell>
                    <TableCell className="text-center">{subj.slot}</TableCell>
                    <TableCell className="text-center">{subj.examDate}</TableCell>
                    <TableCell className="text-center">{subj.examSession}</TableCell>
                    <TableCell className="text-center">{subj.reportingTime}</TableCell>
                    <TableCell className="text-center">{subj.seatNo}</TableCell>
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
