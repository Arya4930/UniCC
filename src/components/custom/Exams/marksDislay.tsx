import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, ChevronRight } from "lucide-react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import NoContentFound from "../NoContentFound";

export default function MarksDisplay({ data }) {
  const [openCourse, setOpenCourse] = useState(null);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setOpenCourse(null);
    }
  };

  if (!data || !data.marks || data.marks.length === 0) {
    return <NoContentFound />;
  }

  return (
    <div className="p-2">
      <h1 className="text-xl font-bold mb-4 text-center text-slate-900 dark:text-slate-100 midnight:text-slate-100">
        Academic Marks
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.marks.map((course, idx) => {
          const formatNumber = (num) => {
            const numericValue = Number(num);
            if (num == null || isNaN(numericValue)) return "-";
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

          const percentage = (totals.weighted / totals.weightPercent) * 100 || 0;

          return (
            <div key={idx}>
              <div
                className="group relative p-4 rounded-2xl shadow-sm transition-all duration-300 cursor-pointer bg-white dark:bg-slate-800 midnight:bg-black border border-slate-200 dark:border-slate-700 midnight:border-gray-800 hover:shadow-lg hover:-translate-y-1"
                onClick={() => setOpenCourse(course.slNo)}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200 midnight:text-slate-200 text-sm mb-1 truncate">
                      {course.courseCode}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 midnight:text-slate-400 line-clamp-2 mb-3">
                      {course.courseTitle}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700 midnight:bg-gray-900 text-slate-600 dark:text-slate-300 midnight:text-slate-300">
                        {course.courseType}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                    </div>
                  </div>

                  <div className="w-16 h-16 flex-shrink-0">
                    <CircularProgressbar
                      value={percentage}
                      text={`${formatNumber(totals.weighted)}`}
                      styles={buildStyles({
                        pathColor: percentage >= 75 ? "#10b981" : percentage >= 50 ? "#f59e0b" : "#ef4444",
                        textColor: "currentColor",
                        trailColor: "#e2e8f0",
                        strokeLinecap: "round",
                        textSize: "24px",
                      })}
                    />
                  </div>
                </div>
              </div>

              {openCourse === course.slNo && (
                <div
                  className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4"
                  onClick={handleBackdropClick}
                >
                  <div className="bg-white dark:bg-slate-900 midnight:bg-black rounded-3xl shadow-2xl w-full max-w-3xl relative max-h-[90vh] overflow-hidden flex flex-col border border-slate-200 dark:border-slate-700 midnight:border-gray-800">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setOpenCourse(null)}
                      className="top-4 right-4 absolute cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 midnight:hover:bg-gray-900 rounded-full z-10"
                    >
                      <X size={20} className="text-slate-600 dark:text-slate-300 midnight:text-slate-200" />
                    </Button>

                    <div className="relative bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 midnight:from-gray-900 midnight:to-black p-6">
                      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 midnight:text-slate-100 pr-8 leading-tight mb-2">
                        {course.courseTitle}
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs font-medium px-3 py-1 rounded-full bg-white dark:bg-slate-800 midnight:bg-gray-900 text-slate-600 dark:text-slate-300 midnight:text-slate-300 border border-slate-200 dark:border-slate-700 midnight:border-gray-800">
                          {course.courseCode}
                        </span>
                        <span className="text-xs font-medium px-3 py-1 rounded-full bg-white dark:bg-slate-800 midnight:bg-gray-900 text-slate-600 dark:text-slate-300 midnight:text-slate-300 border border-slate-200 dark:border-slate-700 midnight:border-gray-800">
                          {course.faculty}
                        </span>
                        <span className="text-xs font-medium px-3 py-1 rounded-full bg-white dark:bg-slate-800 midnight:bg-gray-900 text-slate-600 dark:text-slate-300 midnight:text-slate-300 border border-slate-200 dark:border-slate-700 midnight:border-gray-800">
                          Slot: {course.slot}
                        </span>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                      <div className="space-y-2">
                        {course.assessments.map((asm, asmIdx) => (
                          <div
                            key={asmIdx}
                            className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 midnight:bg-gray-900"
                          >
                            <div className="flex-1">
                              <p className="text-sm font-medium text-slate-800 dark:text-slate-200 midnight:text-slate-200">
                                {asm.title}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 midnight:text-slate-400">
                                {formatNumber(asm.scoredMark)} / {formatNumber(asm.maxMark)} marks
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-slate-700 dark:text-slate-200 midnight:text-slate-200">
                                {formatNumber(asm.weightageMark)}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 midnight:text-slate-400">
                                / {formatNumber(asm.weightagePercent)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-700 dark:to-slate-800 midnight:from-gray-800 midnight:to-gray-900 border-t-2 border-slate-300 dark:border-slate-600 midnight:border-gray-700">
                        <span className="text-base font-bold text-slate-800 dark:text-slate-200 midnight:text-slate-200">
                          Total
                        </span>
                        <span className="text-xl font-bold text-slate-700 dark:text-slate-200 midnight:text-slate-200">
                          {formatNumber(totals.weighted)} / {formatNumber(totals.weightPercent)}
                        </span>
                      </div>
                    </div>
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
