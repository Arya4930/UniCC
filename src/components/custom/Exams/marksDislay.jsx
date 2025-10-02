import { useState } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";

export default function MarksDisplay({ data }) {
  const [openCourse, setOpenCourse] = useState(null);

  const toggleCourse = (slNo) => {
    setOpenCourse(openCourse === slNo ? null : slNo);
  };

  if (!data || !data.marks || data.marks.length === 0) {
    return (
      <p className="text-gray-700 dark:text-gray-300 midnight:text-gray-300">
        No marks data available to display.
      </p>
    );
  }

  return (
    <div className="p-2">
      <h1 className="text-xl font-bold mb-4 text-center text-gray-900 dark:text-gray-100 midnight:text-gray-100">
        Academic Marks
      </h1>

      {/* Grid for cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
            <div
              key={idx}
              className="p-4 rounded-lg shadow bg-white dark:bg-slate-800 midnight:bg-black midnight:outline midnight:outline-1 midnight:outline-gray-800 cursor-pointer"
              onClick={() => toggleCourse(course.slNo)}
            >
              <div className="flex justify-between items-center">
                <div className="flex flex-col items-start">
                  <span className="font-medium text-gray-800 dark:text-gray-200 midnight:text-gray-200 text-sm sm:text-base max-w-xs break-words">
                    {course.courseCode} - {course.courseTitle}
                  </span>

                  <div className="px-3 py-1 flex items-center justify-center bg-gray-200 dark:bg-slate-700 midnight:bg-gray-900 text-black dark:text-gray-300 midnight:text-gray-300 text-xs rounded-full outline outline-1 outline-gray-700 dark:outline-gray-500 midnight:outline-gray-700 mt-2">
                    {course.courseType}
                  </div>
                </div>

                <div className="w-20 h-20 flex-shrink-0 flex flex-col items-center justify-center ml-4">
                  <CircularProgressbar
                    value={(totals.weighted / totals.weightPercent) * 100 || 0}
                    text={`${totals.weighted}/${totals.weightPercent}`}
                    styles={buildStyles({
                      pathColor: "#00ff11ff",
                      textColor: "currentColor",
                      trailColor: "#E5E7EB",
                      strokeLinecap: "round",
                      textSize: "1.2em",
                      textFontWeight: "bold",
                      pathTransitionDuration: 0.5,
                    })}
                  />
                </div>
              </div>

              {/* Full page modal */}
              {openCourse === course.slNo && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
                  <div className="bg-white dark:bg-slate-800 midnight:bg-black rounded-xl shadow-lg p-6 max-w-3xl w-[95%] relative max-h-[90vh] overflow-y-auto">
                    <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100 midnight:text-gray-100">
                      {course.courseCode} – {course.courseTitle}
                    </h2>
                    <p className="mb-1">
                      <strong>Faculty:</strong> {course.faculty}
                    </p>
                    <p className="mb-3">
                      <strong>Slot:</strong> {course.slotName}
                    </p>

                    <div className="overflow-x-auto">
                      <table className="w-full border mt-2 border-gray-300 dark:border-gray-600 midnight:border-gray-700">
                        <thead className="bg-gray-800 text-white dark:bg-slate-700 midnight:bg-gray-900">
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
                            <tr
                              key={asmIdx}
                              className="border-gray-300 dark:border-gray-600 midnight:border-gray-700"
                            >
                              <td className="border p-2">{asm.title}</td>
                              <td className="border p-2">{asm.maxMark}</td>
                              <td className="border p-2">{asm.scoredMark}</td>
                              <td className="border p-2">
                                {asm.weightagePercent}
                              </td>
                              <td className="border p-2">
                                {asm.weightageMark}
                              </td>
                            </tr>
                          ))}

                          <tr className="font-bold border-t border-gray-400 dark:border-gray-500 midnight:border-gray-600">
                            <td className="border p-2">Total</td>
                            <td className="border p-2">{totals.max}</td>
                            <td className="border p-2">{totals.scored}</td>
                            <td className="border p-2">
                              {totals.weightPercent}
                            </td>
                            <td className="border p-2">{totals.weighted}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <button
                      className="absolute top-3 right-3 text-gray-700 dark:text-gray-200 midnight:text-gray-200 hover:text-gray-500 dark:hover:text-gray-400 midnight:hover:text-gray-400"
                      onClick={() => setOpenCourse(null)}
                    >
                      ✕
                    </button>
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
