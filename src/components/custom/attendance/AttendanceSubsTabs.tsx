"use client";

export default function AttendanceSubTabs({ activeSubTab, setActiveAttendanceSubTab }) {
  return (
    <div className="flex justify-center mb-4">
      <div className="inline-flex rounded-full p-1 bg-white dark:bg-slate-800 midnight:bg-gray-900 border border-slate-200 dark:border-slate-700 midnight:border-gray-800 shadow-sm">
        <button
          onClick={() => setActiveAttendanceSubTab("attendance")}
          className={`px-6 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
            activeSubTab === "attendance"
              ? "bg-slate-600 text-white shadow-sm dark:bg-slate-700 midnight:bg-slate-800"
              : "text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100 midnight:text-slate-300 midnight:hover:text-slate-100"
          }`}
        >
          Attendance
        </button>

        <button
          onClick={() => setActiveAttendanceSubTab("calendar")}
          className={`px-6 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
            activeSubTab === "calendar"
              ? "bg-slate-600 text-white shadow-sm dark:bg-slate-700 midnight:bg-slate-800"
              : "text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100 midnight:text-slate-300 midnight:hover:text-slate-100"
          }`}
        >
          Calendar
        </button>
      </div>
    </div>
  );
}
