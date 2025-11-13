"use client";

export default function ExamsSubTabs({ activeSubTab, setActiveSubTab }) {
  return (
    <div className="flex justify-center mb-4">
      <div className="inline-flex rounded-full p-1 bg-white dark:bg-slate-800 midnight:bg-gray-900 border border-slate-200 dark:border-slate-700 midnight:border-gray-800 shadow-sm">
        <button
          onClick={() => setActiveSubTab("marks")}
          className={`px-6 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
            activeSubTab === "marks"
              ? "bg-slate-600 text-white shadow-sm dark:bg-slate-700 midnight:bg-slate-800"
              : "text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100 midnight:text-slate-300 midnight:hover:text-slate-100"
          }`}
        >
          Marks
        </button>

        <button
          onClick={() => setActiveSubTab("schedule")}
          className={`px-6 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
            activeSubTab === "schedule"
              ? "bg-slate-600 text-white shadow-sm dark:bg-slate-700 midnight:bg-slate-800"
              : "text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100 midnight:text-slate-300 midnight:hover:text-slate-100"
          }`}
        >
          Schedule
        </button>

        <button
          onClick={() => setActiveSubTab("grades")}
          className={`px-6 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
            activeSubTab === "grades"
              ? "bg-slate-600 text-white shadow-sm dark:bg-slate-700 midnight:bg-slate-800"
              : "text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100 midnight:text-slate-300 midnight:hover:text-slate-100"
          }`}
        >
          Grades
        </button>
      </div>
    </div>
  );
}
