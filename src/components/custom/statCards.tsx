"use client";

import { useEffect, useState } from "react";
import { RefreshCcw } from "lucide-react";

export default function StatsCards({
  attendancePercentage,
  ODhoursData,
  setODhoursIsOpen,
  marksData,
  feedbackStatus,
  setGradesDisplayIsOpen,
  CGPAHidden,
  setCGPAHidden,
}) {
  const [attendancePercentageOrString, setAttendancePercentageOrString] = useState("percentage");
  useEffect(() => {
    const saved = localStorage.getItem("CGPAHidden");
    const savedAttendancePercentage = localStorage.getItem("attendancePercentageOrString");
    if (savedAttendancePercentage !== null) {
      setAttendancePercentageOrString(savedAttendancePercentage);
    }
    if (saved !== null) {
      setCGPAHidden(saved === "true");
    }
  }, [setCGPAHidden, setAttendancePercentageOrString]);

  useEffect(() => {
    localStorage.setItem("CGPAHidden", CGPAHidden);
    localStorage.setItem("attendancePercentageOrString", attendancePercentageOrString);
  }, [CGPAHidden, attendancePercentageOrString]);

  const totalODHours =
    ODhoursData && ODhoursData.length > 0 && ODhoursData[0].courses
      ? ODhoursData.reduce((sum, day) => sum + day.total, 0)
      : 0;

  const cardBase =
    "cursor-pointer p-6 rounded-2xl shadow hover:shadow-lg transition flex-shrink-0 snap-start w-[calc(50%-8px)] md:w-[calc(25%-12px)] flex flex-col items-center justify-center text-center";

  return (
    <div data-scrollable className="overflow-x-auto snap-x snap-mandatory ml-4 mr-4">
      <div className="flex gap-4 py-4 px-2">
        {/* Card 1 */}
        <div
          className={`${cardBase} bg-white dark:bg-slate-800 midnight:bg-black midnight:border midnight:border-gray-800`}
          onClick={() => setAttendancePercentageOrString((prev) => (prev === "percentage" ? "str" : "percentage"))}
        >
          <h2 className="text-lg font-semibold text-gray-600 dark:text-gray-300 midnight:text-gray-200">Attendance</h2>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 midnight:text-gray-100 mt-2">
            {attendancePercentage[attendancePercentageOrString] || 0}
          </p>
        </div>

        {/* Card 2 */}
        <div
          className={`${cardBase} bg-white dark:bg-slate-800 midnight:bg-black midnight:border midnight:border-gray-800`}
          onClick={() => setODhoursIsOpen(true)}
        >
          <h2 className="text-lg font-semibold text-gray-600 dark:text-gray-300 midnight:text-gray-200">OD hours</h2>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 midnight:text-gray-100 mt-2">
            {totalODHours}/40
          </p>
        </div>

        {/* Card 3 - Feedback Status */}
        {feedbackStatus && <div
          className={`${cardBase} bg-white dark:bg-slate-800 midnight:bg-black midnight:border midnight:border-gray-800`}
          onClick={() => console.log("Feedback Status was clicked")}
        >
          <h2 className="text-lg font-semibold text-gray-600 dark:text-gray-300 midnight:text-gray-200 mb-1">
            Feedback
          </h2>

          <div className="flex items-center justify-center gap-3 mt-2 text-center">
            <div className="flex flex-col items-center">
              <span className="text-xs text-gray-600 dark:text-gray-400 midnight:text-gray-400">
                Mid Sem
              </span>
              <span
                className={`text-base font-bold ${feedbackStatus?.MidSem?.Curriculum && feedbackStatus?.MidSem?.Course
                    ? "text-green-500"
                    : "text-red-500"
                  }`}
              >
                {feedbackStatus?.MidSem?.Curriculum && feedbackStatus?.MidSem?.Course
                  ? "Given"
                  : "Not Given"}
              </span>
            </div>

            <div className="h-8 w-[1.5px] bg-gray-300 dark:bg-gray-600 midnight:bg-gray-700 rounded-full" />

            <div className="flex flex-col items-center">
              <span className="text-xs text-gray-600 dark:text-gray-400 midnight:text-gray-400">
                End Sem
              </span>
              <span
                className={`text-base font-bold ${feedbackStatus?.EndSem?.Curriculum && feedbackStatus?.EndSem?.Course
                    ? "text-green-500"
                    : "text-red-500"
                  }`}
              >
                {feedbackStatus?.EndSem?.Curriculum && feedbackStatus?.EndSem?.Course
                  ? "Given"
                  : "Not Given"}
              </span>
            </div>
          </div>
        </div>}

        {/* Card 3 */}
        {marksData.cgpa && <div
          className={`${cardBase} bg-white dark:bg-slate-800 midnight:bg-black midnight:border midnight:border-gray-800`}
          onClick={() => setCGPAHidden((prev) => !prev)}
        >
          <h2 className="text-lg font-semibold text-gray-600 dark:text-gray-300 midnight:text-gray-200">
            CGPA
          </h2>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 midnight:text-gray-100 mt-2 select-none">
            {CGPAHidden ? "###" : marksData?.cgpa?.cgpa}
          </p>
        </div>
        }

        {/* Card 4 */}
        <div
          className={`${cardBase} bg-white dark:bg-slate-800 midnight:bg-black midnight:border midnight:border-gray-800`}
          onClick={() => setGradesDisplayIsOpen(true)}
        >
          <h2 className="text-lg font-semibold text-gray-600 dark:text-gray-300 midnight:text-gray-200">Credits Earned</h2>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 midnight:text-gray-100 mt-2">
            {Number(marksData?.cgpa?.creditsEarned) + Number(marksData?.cgpa?.nonGradedRequirement || 0)}
          </p>
        </div>
      </div>
    </div>
  );
}
