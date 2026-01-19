"use client";

export default function AttendanceSubTabs({ activeSubTab, setActiveAttendanceSubTab }) {
  return (
    <div className="w-full mb-4">
      <div className="inline-flex w-full rounded-xl bg-gray-100 dark:bg-slate-800 midnight:bg-black border border-gray-200 dark:border-slate-800 midnight:border-gray-900 p-1">
      <button
        onClick={() => setActiveAttendanceSubTab("attendance")}
        className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors ${activeSubTab === "attendance"
          ? "bg-white text-gray-900 shadow-sm dark:bg-slate-900 dark:text-gray-100 midnight:bg-gray-900"
          : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
          }`}
      >
        Attendance
      </button>

      <button
        onClick={() => setActiveAttendanceSubTab("calendar")}
        className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors ${activeSubTab === "calendar"
          ? "bg-white text-gray-900 shadow-sm dark:bg-slate-900 dark:text-gray-100 midnight:bg-gray-900"
          : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
          }`}
      >
        Calendar
      </button>
      </div>
    </div>
  );
}
