import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function MarksDisplay({ data }) {
  const [openCourse, setOpenCourse] = useState(null);

  const toggleCourse = (slNo) => {
    setOpenCourse(openCourse === slNo ? null : slNo);
  };

  if (!data || !data.marks || data.marks.length === 0) {
    return <p>No marks data available to display.</p>;
  }

  return (
    <div className="p-2">
      <h1 className="text-xl font-bold mb-4 text-center">Academic Marks</h1>
      <div className="space-y-4">
        {data.marks.map((course, idx) => {
          // calculate totals
          const totals = course.assessments.reduce(
            (acc, asm) => {
              acc.max += Number(asm.maxMark) || 0;
              acc.scored += Number(asm.scoredMark) || 0;
              acc.weightPercent += Number(asm.weightagePercent) || 0;
              acc.weighted += Number(asm.weightageMark) || 0;
              return acc;
            },
            { max: 0, scored: 0, weightPercent: 0, weighted: 0 }
          );

          return (
            <div key={idx} className="p-4 rounded-lg shadow">
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleCourse(course.slNo)}
              >
                <span className="font-medium">
                  {course.courseCode} - {course.courseTitle}
                </span>
                {openCourse === course.slNo ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </div>
              {openCourse === course.slNo && (
                <div className="mt-4">
                  <p>
                    <strong>Faculty:</strong> {course.faculty}
                  </p>
                  <p>
                    <strong>Slot:</strong> {course.slotName}
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full border mt-2">
                      <thead className="bg-gray-800 text-white">
                        <tr>
                          <th className="border p-2 text-left">Test</th>
                          <th className="border p-2">Max</th>
                          <th className="border p-2">Scored</th>
                          <th className="border p-2">Weight %</th>
                          <th className="border p-2">Weighted</th>
                        </tr>
                      </thead>
                      <tbody>
                        {course.assessments.map((asm, asmIdx) => (
                          <tr key={asmIdx}>
                            <td className="border p-2">{asm.title}</td>
                            <td className="border p-2">{asm.maxMark}</td>
                            <td className="border p-2">{asm.scoredMark}</td>
                            <td className="border p-2">
                              {asm.weightagePercent}
                            </td>
                            <td className="border p-2">{asm.weightageMark}</td>
                          </tr>
                        ))}
                        {/* totals row */}
                        <tr className="font-bold">
                          <td className="border p-2">Total</td>
                          <td className="border p-2">{totals.max}</td>
                          <td className="border p-2">{totals.scored}</td>
                          <td className="border p-2">{totals.weightPercent}</td>
                          <td className="border p-2">{totals.weighted}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
