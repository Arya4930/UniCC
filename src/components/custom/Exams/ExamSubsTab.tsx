"use client";

export default function ExamsSubTabs({ activeSubTab, setActiveSubTab }) {
  return (
    <div className="w-full mb-4">
      <div className="inline-flex w-full rounded-xl bg-gray-100 dark:bg-slate-800 midnight:bg-black border border-gray-200 dark:border-slate-800 midnight:border-gray-900 p-1">
      <button
        onClick={() => setActiveSubTab("marks")}
        className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors ${activeSubTab === "marks"
          ? "bg-white text-gray-900 shadow-sm dark:bg-slate-900 dark:text-gray-100 midnight:bg-gray-900"
          : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
          }`}
      >
        Marks
      </button>

      <button
        onClick={() => setActiveSubTab("schedule")}
        className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors ${activeSubTab === "schedule"
          ? "bg-white text-gray-900 shadow-sm dark:bg-slate-900 dark:text-gray-100 midnight:bg-gray-900"
          : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
          }`}
      >
        Schedule
      </button>
      <button
        onClick={() => setActiveSubTab("grades")}
        className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors ${activeSubTab === "grades"
          ? "bg-white text-gray-900 shadow-sm dark:bg-slate-900 dark:text-gray-100 midnight:bg-gray-900"
          : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
          }`}
      >
        Grades
      </button>
      </div>
    </div>
  );
}
