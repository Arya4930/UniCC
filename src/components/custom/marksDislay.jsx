import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";

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
                <div className="flex flex-col items-start">
                  <span className="font-medium text-gray-800 text-sm sm:text-base max-w-xs break-words">
                    {course.courseCode} - {course.courseTitle}
                  </span>

                  <div className="w-20 h-6 flex items-center justify-center bg-gray-200 text-black text-xs rounded-full outline outline-1 outline-gray-700 mt-2">
  {course.courseType}
</div>

                </div>

                <div className="w-20 h-20 flex-shrink-0 flex flex-col items-center justify-center ml-4">
                  <CircularProgressbar
                    value={totals.weighted}
                    text={`${totals.weighted}/100`}
                    styles={buildStyles({
                      pathColor: "#00ff11ff",
                      textColor: "#111827",
                      trailColor: "#E5E7EB",
                      strokeLinecap: "round",
                      textSize: "1.2em",
                      pathTransitionDuration: 0.5,
                    })}
                  />
                </div>
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
