"use client";
import { useState } from "react";
import { LogOut, RefreshCcw } from "lucide-react";
import { ModeToggle } from "./toggle";

export default function NavigationTabs({
  activeTab,
  setActiveTab,
  handleLogOutRequest,
  handleReloadRequest,
}) {
  const [isSpinning, setIsSpinning] = useState(false);

  const handleReloadClick = async () => {
    setIsSpinning(true);
    await handleReloadRequest();
    setTimeout(() => setIsSpinning(false), 600);
  };

  const tabBase = "flex-1 py-3 text-sm font-medium transition-colors";
  const tabActive = "bg-blue-600 text-white dark:bg-blue-500 dark:text-gray-100";
  const tabInactive =
    "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700";

  return (
    <div className="flex w-full shadow-sm pb-4 dark:bg-slate-900">
      <button
        onClick={handleLogOutRequest}
        className="w-12 flex items-center justify-center bg-red-500 hover:cursor-pointer text-white text-sm font-medium hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 transition-colors"
      >
        <LogOut className="w-4 h-4" />
      </button>

      <button
        onClick={() => setActiveTab("attendance")}
        className={`${tabBase} ${
          activeTab === "attendance" ? tabActive : tabInactive
        }`}
      >
        Attendance
      </button>

      <button
        onClick={() => setActiveTab("exams")}
        className={`${tabBase} ${
          activeTab === "exams" ? tabActive : tabInactive
        }`}
      >
        Exams
      </button>

      <button
        onClick={() => setActiveTab("hostel")}
        className={`${tabBase} ${
          activeTab === "hostel" ? tabActive : tabInactive
        }`}
      >
        Hostel
      </button>

      <button
        onClick={handleReloadClick}
        className="w-12 flex items-center justify-center bg-blue-500 hover:cursor-pointer text-white text-sm font-medium hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
      >
        <RefreshCcw className={`w-4 h-4 ${isSpinning ? "animate-spin" : ""}`} />
      </button>
      
    </div>
  );
}
