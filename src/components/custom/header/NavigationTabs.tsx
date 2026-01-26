"use client";
import { useState } from "react";
import { LogOut, RefreshCcw, Settings } from "lucide-react";
import SettingsPage from "./SettingsPage";

export default function NavigationTabs({
  activeTab,
  setActiveTab,
  handleLogOutRequest,
  handleReloadRequest,
  currSemesterID, 
  setCurrSemesterID, 
  handleLogin, 
  setIsReloading,
  password,
  setPassword
}) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [showSettingsPage, setShowSettingsPage] = useState<boolean>(false);

  const handleReloadClick = async () => {
    setIsSpinning(true);
    await handleReloadRequest();
    setTimeout(() => setIsSpinning(false), 600);
  };

  const tabBase = "flex-1 py-3 text-sm font-medium transition-colors";
  const tabActive = "bg-blue-600 text-white dark:bg-blue-500 dark:text-gray-100 midnight:bg-blue-700 midnight:text-gray-100";
  const tabInactive =
    "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700 midnight:bg-black midnight:text-gray-100 midnight:hover:bg-gray-800";

  return (
    <div data-scrollable className="flex w-full shadow-sm pb-4 dark:bg-slate-900 midnight:bg-black">
      {showSettingsPage && <SettingsPage 
        handleClose={() => setShowSettingsPage(false)}
        currSemesterID={currSemesterID} 
        setCurrSemesterID={setCurrSemesterID} 
        handleLogin={handleLogin} 
        setIsReloading={setIsReloading}
        handleLogOutRequest={handleLogOutRequest}
        password={password}
        setPassword={setPassword}
      />}
      <button
        onClick={() => setShowSettingsPage(true)}
        className="w-12 flex items-center justify-center bg-gray-400 hover:cursor-pointer text-white text-sm font-medium hover:bg-gray-500 dark:bg-gray-500 dark:hover:bg-gray-600 midnight:bg-gray-600 midnight:hover:bg-gray-700 transition-colors"
      >
        <Settings className="w-5 h-5" />
      </button>

      <button
        onClick={() => setActiveTab("attendance")}
        className={`${tabBase} ${activeTab === "attendance" ? tabActive : tabInactive
          }`}
      >
        Attendance
      </button>

      <button
        onClick={() => setActiveTab("exams")}
        className={`${tabBase} ${activeTab === "exams" ? tabActive : tabInactive
          }`}
      >
        Exams
      </button>

      <button
        onClick={() => setActiveTab("hostel")}
        className={`${tabBase} ${activeTab === "hostel" ? tabActive : tabInactive
          }`}
      >
        Hostel
      </button>

      <button
        onClick={handleReloadClick}
        className="w-12 flex items-center justify-center bg-blue-500 hover:cursor-pointer text-white text-sm font-medium hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 midnight:bg-blue-800 transition-colors"
      >
        <RefreshCcw className={`w-4 h-4 ${isSpinning ? "animate-spin" : ""}`} />
      </button>

    </div>
  );
}
