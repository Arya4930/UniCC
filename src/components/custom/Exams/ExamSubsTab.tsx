"use client";

export default function ExamsSubTabs({ activeSubTab, setActiveSubTab }) {
  return (
    <div className="flex w-full mb-4">
      <button
        onClick={() => setActiveSubTab("marks")}
        className={`flex-1 py-2 text-sm font-medium transition-colors ${activeSubTab === "marks"
            ? "bg-blue-600 text-white midnight:bg-blue-700"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600  midnight:bg-black midnight:text-gray-300 midnight:hover:bg-gray-900"
          }`}
      >
        Marks
      </button>

      <button
        onClick={() => setActiveSubTab("schedule")}
        className={`flex-1 py-2 text-sm font-medium transition-colors ${activeSubTab === "schedule"
            ? "bg-blue-600 text-white midnight:bg-blue-700"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600  midnight:bg-black midnight:text-gray-300 midnight:hover:bg-gray-900"
          }`}
      >
        Schedule
      </button>
      <button
        onClick={() => setActiveSubTab("grades")}
        className={`flex-1 py-2 text-sm font-medium transition-colors ${activeSubTab === "grades"
            ? "bg-blue-600 text-white midnight:bg-blue-700"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600  midnight:bg-black midnight:text-gray-300 midnight:hover:bg-gray-900"
          }`}
      >
        Grades
      </button>
    </div>
  );
}
