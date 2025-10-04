"use client";

export default function AttendanceSubTabs({ activeSubTab, setActiveAttendanceSubTab }) {
  return (
    <div className="flex w-full mb-4">
      <button
        onClick={() => setActiveAttendanceSubTab("attendance")}
        className={`flex-1 py-2 text-sm font-medium transition-colors ${activeSubTab === "attendance"
            ? "bg-blue-600 text-white midnight:bg-blue-700"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600  midnight:bg-black midnight:text-gray-300 midnight:hover:bg-gray-900"
          }`}
      >
        Attendance
      </button>

      <button
        onClick={() => setActiveAttendanceSubTab("calendar")}
        className={`flex-1 py-2 text-sm font-medium transition-colors ${activeSubTab === "calendar"
            ? "bg-blue-600 text-white midnight:bg-blue-700"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600  midnight:bg-black midnight:text-gray-300 midnight:hover:bg-gray-900"
          }`}
      >
        Calendar
      </button>
    </div>
  );
}
