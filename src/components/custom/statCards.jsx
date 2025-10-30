"use client";

import { useEffect, useState } from "react";
import { RefreshCcw } from "lucide-react";

export default function StatsCards({
  attendancePercentage,
  ODhoursData,
  setODhoursIsOpen,
  GradesData,
  setGradesDisplayIsOpen,
  CGPAHidden,
  setCGPAHidden,
  handleFetchGrades
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
            {attendancePercentage[attendancePercentageOrString]}
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

        {/* Card 3 */}
        {GradesData.cgpa ? (<div
          className={`${cardBase} bg-white dark:bg-slate-800 midnight:bg-black midnight:border midnight:border-gray-800`}
          onClick={() => setCGPAHidden((prev) => !prev)}
        >
          <h2 className="text-lg font-semibold text-gray-600 dark:text-gray-300 midnight:text-gray-200">
            CGPA
          </h2>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 midnight:text-gray-100 mt-2 select-none">
            {CGPAHidden ? "###" : GradesData?.cgpa?.cgpa}
          </p>
        </div>) : (
          <div
            className={`${cardBase} bg-white dark:bg-slate-800 midnight:bg-black midnight:border midnight:border-gray-800`}
          >
            <h2 className="text-lg font-semibold text-gray-600 dark:text-gray-300 midnight:text-gray-200">
              CGPA
            </h2>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 midnight:text-gray-100 mt-2 select-none">
              N/A <button onClick={handleFetchGrades} className="mt-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors">
                <RefreshCcw className={`w-4 h-4`} />
              </button>
            </p>
          </div>
        )}

        {/* Card 4 */}
        <div
          className={`${cardBase} bg-white dark:bg-slate-800 midnight:bg-black midnight:border midnight:border-gray-800`}
          onClick={() => setGradesDisplayIsOpen(true)}
        >
          <h2 className="text-lg font-semibold text-gray-600 dark:text-gray-300 midnight:text-gray-200">Credits Earned</h2>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 midnight:text-gray-100 mt-2">
            {Number(GradesData?.cgpa?.creditsEarned) + Number(GradesData?.cgpa?.nonGradedRequirement || 0)}
          </p>
        </div>
      </div>
    </div>
  );
}
