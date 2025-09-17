"use client";
import { useState } from "react";
import { RefreshCcw } from "lucide-react";

export default function NavigationTabs({
  activeTab,
  setActiveTab,
  handleReloadRequest,
}) {
  const [isSpinning, setIsSpinning] = useState(false);

  const handleReloadClick = async () => {
    setIsSpinning(true);
    await handleReloadRequest();
    setTimeout(() => setIsSpinning(false), 600);
  };

  return (
    <div className="flex w-full shadow-sm pb-4">
      <button
        onClick={() => setActiveTab("attendance")}
        className={`flex-1 py-3 text-sm font-medium transition-colors ${
          activeTab === "attendance"
            ? "bg-blue-600 text-white"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        }`}
      >
        Attendance
      </button>

      <button
        onClick={() => setActiveTab("exams")}
        className={`flex-1 py-3 text-sm font-medium transition-colors ${
          activeTab === "exams"
            ? "bg-blue-600 text-white"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        }`}
      >
        Exams
      </button>

      <button
        onClick={handleReloadClick}
        className="w-12 flex items-center justify-center bg-blue-500 hover:cursor-pointer text-white text-sm font-medium hover:bg-blue-700 transition-colors"
      >
        <RefreshCcw className={`w-4 h-4 ${isSpinning ? "animate-spin" : ""}`} />
      </button>
    </div>
  );
}