"use client";

export default function HostelSubTabs({
  HostelActiveSubTab,
  setHostelActiveSubTab,
  hostelData
}) {
  const parseDate = (dateStr) => {
    const parts = dateStr.split(/[-/ ]/);
    if (parts.length === 3) {
      const [day, monthStr, year] = parts;
      const month = new Date(`${monthStr} 1, 2000`).getMonth();
      return new Date(year, month, parseInt(day));
    }
    return new Date(dateStr);
  };

  const now = new Date();
  const activeLeaves = hostelData.leaveHistory?.filter((leave) => {
    const from = parseDate(leave.from);
    const to = parseDate(leave.to);
    const daysSinceEnd = (now - to) / (1000 * 60 * 60 * 24);
    return (
      (from <= now && now <= to) ||
      from > now ||
      (daysSinceEnd > 0 && daysSinceEnd <= 3)
    );
  });

  return (
    <div className="flex w-full mb-4">
      <button
        onClick={() => setHostelActiveSubTab("mess")}
        className={`flex-1 py-2 text-sm font-medium transition-colors ${HostelActiveSubTab === "mess"
          ? "bg-blue-600 text-white"
          : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600 midnight:bg-black midnight:text-gray-300 midnight:hover:bg-gray-900"
          }`}
      >
        Mess
      </button>

      <button
        onClick={() => setHostelActiveSubTab("laundry")}
        className={`flex-1 py-2 text-sm font-medium transition-colors ${HostelActiveSubTab === "laundry"
          ? "bg-blue-600 text-white"
          : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600 midnight:bg-black midnight:text-gray-300 midnight:hover:bg-gray-900"
          }`}
      >
        Laundry
      </button>
      {activeLeaves && activeLeaves.length > 0 && hostelData.leaveHistory && (
        <button
          onClick={() => setHostelActiveSubTab("leave")}
          className={`flex-1 py-2 text-sm font-medium transition-colors ${HostelActiveSubTab === "leave"
            ? "bg-blue-600 text-white"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600 midnight:bg-black midnight:text-gray-300 midnight:hover:bg-gray-900"
            }`}
        >
          Leave
        </button>
      )}
    </div>
  );
}