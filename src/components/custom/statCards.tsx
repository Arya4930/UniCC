"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Clock4, GraduationCap, Layers } from "lucide-react";

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
    "cursor-pointer p-5 rounded-2xl border border-gray-200/70 dark:border-slate-800 midnight:border-gray-900 bg-white dark:bg-slate-900/60 midnight:bg-black/60 transition hover:shadow-md";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <button
        type="button"
        className={cardBase}
        onClick={() => setAttendancePercentageOrString((prev) => (prev === "percentage" ? "str" : "percentage"))}
        aria-pressed={attendancePercentageOrString === "percentage"}
      >
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Attendance</div>
          <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="mt-3 text-3xl font-semibold text-gray-900 dark:text-gray-100">
          {attendancePercentage[attendancePercentageOrString] || 0}
        </div>
        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">Tap to toggle view</div>
      </button>

      <button
        type="button"
        className={cardBase}
        onClick={() => setODhoursIsOpen(true)}
      >
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">OD hours</div>
          <Clock4 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="mt-3 text-3xl font-semibold text-gray-900 dark:text-gray-100">
          {totalODHours}/40
        </div>
        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">View summary</div>
      </button>

      {marksData.cgpa && (
        <button
          type="button"
          className={cardBase}
          onClick={() => setCGPAHidden((prev) => !prev)}
          aria-pressed={!CGPAHidden}
        >
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">CGPA</div>
            <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="mt-3 text-3xl font-semibold text-gray-900 dark:text-gray-100 select-none">
            {CGPAHidden ? "###" : marksData?.cgpa?.cgpa}
          </div>
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">Tap to hide/show</div>
        </button>
      )}

      <button
        type="button"
        className={cardBase}
        onClick={() => setGradesDisplayIsOpen(true)}
      >
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Credits earned</div>
          <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="mt-3 text-3xl font-semibold text-gray-900 dark:text-gray-100">
          {Number(marksData?.cgpa?.creditsEarned) + Number(marksData?.cgpa?.nonGradedRequirement || 0)}
        </div>
        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">Open grade summary</div>
      </button>

      {feedbackStatus && (
        <div className={cardBase} aria-label="Feedback status">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Feedback</div>
            <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-lg border border-gray-200 dark:border-slate-800 p-2">
              <div className="text-xs text-gray-500 dark:text-gray-400">Mid Sem</div>
              <div
                className={`font-semibold ${feedbackStatus?.MidSem?.Curriculum && feedbackStatus?.MidSem?.Course
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
                  }`}
              >
                {feedbackStatus?.MidSem?.Curriculum && feedbackStatus?.MidSem?.Course
                  ? "Given"
                  : "Not given"}
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 dark:border-slate-800 p-2">
              <div className="text-xs text-gray-500 dark:text-gray-400">End Sem</div>
              <div
                className={`font-semibold ${feedbackStatus?.EndSem?.Curriculum && feedbackStatus?.EndSem?.Course
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
                  }`}
              >
                {feedbackStatus?.EndSem?.Curriculum && feedbackStatus?.EndSem?.Course
                  ? "Given"
                  : "Not given"}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
