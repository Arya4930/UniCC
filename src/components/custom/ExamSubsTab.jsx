"use client";

export default function ExamsSubTabs({
  activeSubTab,
  setActiveSubTab
}) {
  return (
    <div className="flex w-full pb-2 mb-4">
      <button 
        onClick={() => setActiveSubTab("marks")}
        className={`basis-1/2 text-sm font-medium transition-colors rounded-none hover:cursor-pointer ${
          activeSubTab === "marks" 
            ? "bg-blue-600 text-white hover:bg-blue-700" 
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        }`}
      >
        Marks
      </button>
      
      <button 
        onClick={() => setActiveSubTab("schedule")}
        className={`basis-1/2 text-center px-3 py-2 text-sm font-medium hover:cursor-pointer transition-colors ${
          activeSubTab === "schedule" 
            ? "bg-blue-600 text-white" 
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        }`}
      >
        Schedule
      </button>
    </div>
  );
}