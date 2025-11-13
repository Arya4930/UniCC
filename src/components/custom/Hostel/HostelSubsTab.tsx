"use client";

export default function HostelSubTabs({
  HostelActiveSubTab,
  setHostelActiveSubTab,
  hostelData
}) {
  return (
    <div className="flex justify-center mb-4">
      <div className="inline-flex rounded-full p-1 bg-white dark:bg-slate-800 midnight:bg-gray-900 border border-slate-200 dark:border-slate-700 midnight:border-gray-800 shadow-sm">
        <button
          onClick={() => setHostelActiveSubTab("mess")}
          className={`px-6 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
            HostelActiveSubTab === "mess"
              ? "bg-slate-600 text-white shadow-sm dark:bg-slate-700 midnight:bg-slate-800"
              : "text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100 midnight:text-slate-300 midnight:hover:text-slate-100"
          }`}
        >
          Mess
        </button>

        <button
          onClick={() => setHostelActiveSubTab("laundry")}
          className={`px-6 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
            HostelActiveSubTab === "laundry"
              ? "bg-slate-600 text-white shadow-sm dark:bg-slate-700 midnight:bg-slate-800"
              : "text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100 midnight:text-slate-300 midnight:hover:text-slate-100"
          }`}
        >
          Laundry
        </button>

        {hostelData?.leaveHistory && hostelData.leaveHistory.length > 0 && (
          <button
            onClick={() => setHostelActiveSubTab("leave")}
            className={`px-6 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
              HostelActiveSubTab === "leave"
                ? "bg-slate-600 text-white shadow-sm dark:bg-slate-700 midnight:bg-slate-800"
                : "text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100 midnight:text-slate-300 midnight:hover:text-slate-100"
            }`}
          >
            Leave
          </button>
        )}
      </div>
    </div>
  );
}