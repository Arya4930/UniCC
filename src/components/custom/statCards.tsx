"use client";

import { useEffect, useState } from "react";

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
    "cursor-pointer p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 flex flex-col items-center justify-center text-center backdrop-blur-sm border hover:-translate-y-0.5 flex-shrink-0 w-[calc(50%-0.375rem)] md:w-auto";

  return (
    <div className="px-4 py-4">
      <div className="max-w-6xl mx-auto">
        {/* Mobile: Horizontal scroll with snap, Desktop: Grid */}
        <div 
          data-scrollable
          className="flex md:grid md:grid-cols-3 lg:grid-cols-5 gap-3 overflow-x-auto md:overflow-x-visible snap-x snap-mandatory scrollbar-hide"
        >
          {/* Card 1 - Attendance */}
          <div
            className={`${cardBase} snap-start bg-gradient-to-br from-blue-50 to-white border-blue-200 dark:from-blue-950/30 dark:to-slate-900 dark:border-blue-800/30 midnight:from-blue-950/20 midnight:to-black midnight:border-blue-900/30`}
            onClick={() => setAttendancePercentageOrString((prev) => (prev === "percentage" ? "str" : "percentage"))}
          >
            <h2 className="text-xs font-semibold text-blue-600 dark:text-blue-400 midnight:text-blue-300 mb-1.5">
              Attendance
            </h2>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300 midnight:text-blue-200">
              {attendancePercentage[attendancePercentageOrString] || 0}%
            </p>
          </div>

          {/* Card 2 - OD Hours */}
          <div
            className={`${cardBase} snap-start bg-gradient-to-br from-purple-50 to-white border-purple-200 dark:from-purple-950/30 dark:to-slate-900 dark:border-purple-800/30 midnight:from-purple-950/20 midnight:to-black midnight:border-purple-900/30`}
            onClick={() => setODhoursIsOpen(true)}
          >
            <h2 className="text-xs font-semibold text-purple-600 dark:text-purple-400 midnight:text-purple-300 mb-1.5">
              OD Hours
            </h2>
            <p className="text-2xl font-bold text-purple-700 dark:text-purple-300 midnight:text-purple-200">
              {totalODHours}/40
            </p>
          </div>

          {/* Card 3 - Feedback Status */}
          {feedbackStatus && (
            <div
              className={`${cardBase} snap-start bg-gradient-to-br from-amber-50 to-white border-amber-200 dark:from-amber-950/30 dark:to-slate-900 dark:border-amber-800/30 midnight:from-amber-950/20 midnight:to-black midnight:border-amber-900/30`}
              onClick={() => console.log("Feedback Status was clicked")}
            >
              <h2 className="text-xs font-semibold text-amber-600 dark:text-amber-400 midnight:text-amber-300 mb-1.5">
                Feedback
              </h2>
              <div className="flex items-center gap-3 mt-0.5">
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-amber-600/70 dark:text-amber-400/70 midnight:text-amber-300/70">Mid</span>
                  <span className={`text-lg font-bold ${feedbackStatus?.MidSem?.Curriculum && feedbackStatus?.MidSem?.Course ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                    {feedbackStatus?.MidSem?.Curriculum && feedbackStatus?.MidSem?.Course ? "✓" : "✗"}
                  </span>
                </div>
                <div className="h-6 w-[1px] bg-amber-300 dark:bg-amber-700/50" />
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-amber-600/70 dark:text-amber-400/70 midnight:text-amber-300/70">End</span>
                  <span className={`text-lg font-bold ${feedbackStatus?.EndSem?.Curriculum && feedbackStatus?.EndSem?.Course ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                    {feedbackStatus?.EndSem?.Curriculum && feedbackStatus?.EndSem?.Course ? "✓" : "✗"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Card 4 - CGPA */}
          {marksData.cgpa && (
            <div
              className={`${cardBase} snap-start bg-gradient-to-br from-emerald-50 to-white border-emerald-200 dark:from-emerald-950/30 dark:to-slate-900 dark:border-emerald-800/30 midnight:from-emerald-950/20 midnight:to-black midnight:border-emerald-900/30`}
              onClick={() => setCGPAHidden((prev) => !prev)}
            >
              <h2 className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 midnight:text-emerald-300 mb-1.5">
                CGPA
              </h2>
              <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 midnight:text-emerald-200 select-none">
                {CGPAHidden ? "•••" : marksData?.cgpa?.cgpa}
              </p>
            </div>
          )}

          {/* Card 5 - Credits */}
          {marksData.cgpa && (
            <div
              className={`${cardBase} snap-start bg-gradient-to-br from-rose-50 to-white border-rose-200 dark:from-rose-950/30 dark:to-slate-900 dark:border-rose-800/30 midnight:from-rose-950/20 midnight:to-black midnight:border-rose-900/30`}
              onClick={() => setGradesDisplayIsOpen(true)}
            >
              <h2 className="text-xs font-semibold text-rose-600 dark:text-rose-400 midnight:text-rose-300 mb-1.5">
                Credits
              </h2>
              <p className="text-2xl font-bold text-rose-700 dark:text-rose-300 midnight:text-rose-200">
                {Number(marksData?.cgpa?.creditsEarned) + Number(marksData?.cgpa?.nonGradedRequirement || 0)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
