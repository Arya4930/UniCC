"use client";
import { useState } from "react";
import { LogOut, RefreshCcw } from "lucide-react";

export default function NavigationTabs({
  activeTab,
  setActiveTab,
  handleLogOutRequest,
  handleReloadRequest,
}) {
  const [isReloading, setIsReloading] = useState(false);

  const handleReloadClick = async () => {
    setIsReloading(true);
    try {
      await handleReloadRequest();
    } finally {
      setTimeout(() => setIsReloading(false), 800);
    }
  };

  return (
    <div className="flex w-full pb-2 mb-4">
      <button
        onClick={handleLogOutRequest}
        className="flex items-center justify-center bg-red-500 text-white px-3 py-2 hover:bg-red-600 transition-colors rounded-l"
      >
        <LogOut className="w-4 h-4" />
      </button>

      <button
        onClick={() => setActiveTab("attendance")}
        className={`flex-1 text-sm font-medium px-3 py-2 transition-colors ${
          activeTab === "attendance"
            ? "bg-blue-600 text-white hover:bg-blue-700"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        }`}
      >
        Attendance
      </button>

      <button
        onClick={() => setActiveTab("exams")}
        className={`flex-1 text-sm font-medium px-3 py-2 transition-colors ${
          activeTab === "exams"
            ? "bg-blue-600 text-white hover:bg-blue-700"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        }`}
      >
        Exams
      </button>

      <button
        onClick={() => setActiveTab("hostel")}
        className={`flex-1 text-sm font-medium px-3 py-2 transition-colors ${
          activeTab === "hostel"
            ? "bg-blue-600 text-white hover:bg-blue-700"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        }`}
      >
        Hostel
      </button>

      <button
        onClick={handleReloadClick}
        className="flex items-center justify-center bg-blue-500 text-white px-3 py-2 hover:bg-blue-700 transition-colors rounded-r"
      >
        <RefreshCcw className={`w-4 h-4 ${isReloading ? "animate-spin" : ""}`} />
      </button>
    </div>
  );
}
