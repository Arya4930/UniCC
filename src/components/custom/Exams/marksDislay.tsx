import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import NoContentFound from "../NoContentFound";

export default function MarksDisplay({ data, moodleData, handleFetchMoodle }) {
  const [openCourse, setOpenCourse] = useState(null);

  const toggleCourse = (slNo) => {
    setOpenCourse(openCourse === slNo ? null : slNo);
  };

  if (!data || !data.marks || data.marks.length === 0) {
    return (
      <>
        <NoContentFound />
        {/* <MoodleDisplay moodleData={moodleData} handleFetchMoodle={handleFetchMoodle} /> */}
      </>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-100">Marks</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Assessment-wise performance per course.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.marks.map((course, idx) => {
          const formatNumber = (num) => {
            const numericValue = Number(num);
            if (num == null || isNaN(numericValue)) {
              return "-";
            }
            return Number(numericValue.toFixed(2)).toString();
          };
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
              className="p-4 rounded-2xl border border-gray-200/70 dark:border-slate-800 midnight:border-gray-900 bg-white dark:bg-slate-900/60 midnight:bg-black/60 hover:shadow-md transition cursor-pointer"
              onClick={() => toggleCourse(course.slNo)}
            >
              <div className="flex justify-between items-center">
                <div className="flex flex-col items-start">
                  <span className="font-medium text-gray-800 dark:text-gray-200 midnight:text-gray-200 text-sm sm:text-base max-w-xs break-words">
                    {course.courseCode} - {course.courseTitle}
                  </span>

                  <div className="px-3 py-1 flex items-center justify-center bg-gray-100 dark:bg-slate-800 midnight:bg-gray-900 text-gray-700 dark:text-gray-300 midnight:text-gray-300 text-xs rounded-full border border-gray-200 dark:border-slate-700 midnight:border-gray-800 mt-2">
                    {course.courseType}
                  </div>
                </div>

                <div className="w-20 h-20 flex-shrink-0 flex flex-col items-center justify-center ml-4">
                  <CircularProgressbar
                    value={(totals.weighted / totals.weightPercent) * 100 || 0}
                    text={`${formatNumber(totals.weighted)}/${formatNumber(
                      totals.weightPercent
                    )}`}
                    styles={buildStyles({
                      pathColor: "#22c55e",
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
                <div data-scrollable className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
                  <div className="bg-white dark:bg-slate-900 midnight:bg-black rounded-2xl shadow-lg p-6 max-w-3xl w-[95%] relative max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                    <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100 midnight:text-gray-100">
                      {course.courseCode} – {course.courseTitle}
                    </h2>
                    <p className="mb-1">
                      <strong>Faculty:</strong> {course.faculty}
                    </p>
                    <p className="mb-3">
                      <strong>Slot:</strong> {course.slot}
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
                              <td className="border p-2">
                                {formatNumber(asm.maxMark)}
                              </td>
                              <td className="border p-2">
                                {formatNumber(asm.scoredMark)}
                              </td>
                              <td className="border p-2">
                                {formatNumber(asm.weightagePercent)}
                              </td>
                              <td className="border p-2">
                                {formatNumber(asm.weightageMark)}
                              </td>
                            </tr>
                          ))}

                          <tr className="font-bold border-t border-gray-400 dark:border-gray-500 midnight:border-gray-600">
                            <td className="border p-2">Total</td>
                            <td className="border p-2">
                              {formatNumber(totals.max)}
                            </td>
                            <td className="border p-2">
                              {formatNumber(totals.scored)}
                            </td>
                            <td className="border p-2">
                              {formatNumber(totals.weightPercent)}
                            </td>
                            <td className="border p-2">
                              {formatNumber(totals.weighted)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setOpenCourse(null)}
                      className="top-2 right-2 absolute cursor-pointer hover:bg-gray-200 dark:hover:bg-slate-800 midnight:hover:bg-gray-900"
                    >
                      <X size={22} className="text-gray-600 dark:text-gray-300 midnight:text-gray-200" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* <MoodleDisplay moodleData={moodleData} handleFetchMoodle={handleFetchMoodle} /> */}
    </div>
  );
}
