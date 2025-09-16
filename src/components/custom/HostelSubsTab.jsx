"use client";

export default function HostelSubTabs({
  HostelActiveSubTab,
  setHostelActiveSubTab
}) {
  return (
    <div className="flex w-full pb-2 mb-4">
      <button 
        onClick={() => setHostelActiveSubTab("mess")}
        className={`basis-1/2 text-sm font-medium transition-colors rounded-none hover:cursor-pointer ${
          HostelActiveSubTab === "mess" 
            ? "bg-blue-600 text-white hover:bg-blue-700" 
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        }`}
      >
        Mess
      </button>
      
      <button 
        onClick={() => setHostelActiveSubTab("laundry")}
        className={`basis-1/2 text-center px-3 py-2 text-sm font-medium hover:cursor-pointer transition-colors ${
          HostelActiveSubTab === "laundry" 
            ? "bg-blue-600 text-white" 
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        }`}
      >
        Laundry
      </button>
    </div>
  );
}