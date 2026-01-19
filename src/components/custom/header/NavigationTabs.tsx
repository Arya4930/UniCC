"use client";
import { useState } from "react";
import { RefreshCcw, Settings, ClipboardList, GraduationCap, BedDouble } from "lucide-react";
import SettingsPage from "./SettingsPage";

export default function NavigationTabs({
  activeTab,
  setActiveTab,
  handleLogOutRequest,
  handleReloadRequest,
  currSemesterID, 
  setCurrSemesterID, 
  handleLogin, 
  setIsReloading
}) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [showSettingsPage, setShowSettingsPage] = useState<boolean>(false);

  const handleReloadClick = async () => {
    setIsSpinning(true);
    await handleReloadRequest();
    setTimeout(() => setIsSpinning(false), 600);
  };

  const tabs = [
    { id: "attendance", label: "Attendance", icon: ClipboardList },
    { id: "exams", label: "Exams", icon: GraduationCap },
    { id: "hostel", label: "Hostel", icon: BedDouble },
  ];

  const tabBase =
    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors";
  const tabActive =
    "bg-blue-600 text-white dark:bg-blue-500 midnight:bg-blue-700";
  const tabInactive =
    "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800 midnight:text-gray-200 midnight:hover:bg-gray-900";

  return (
    <>
      {showSettingsPage && (
        <SettingsPage
          handleClose={() => setShowSettingsPage(false)}
          currSemesterID={currSemesterID}
          setCurrSemesterID={setCurrSemesterID}
          handleLogin={handleLogin}
          setIsReloading={setIsReloading}
          handleLogOutRequest={handleLogOutRequest}
        />
      )}

      {/* Mobile top nav */}
      <div className="md:hidden sticky top-0 z-40 w-full border-b border-gray-200 dark:border-slate-800 midnight:border-gray-900 bg-white/90 dark:bg-slate-900/90 midnight:bg-black/90 backdrop-blur">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex flex-col">
            <span className="text-base font-semibold text-gray-900 dark:text-gray-100">UniCC</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">Student dashboard</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettingsPage(true)}
              className="h-9 w-9 rounded-lg border border-gray-200 dark:border-slate-800 midnight:border-gray-800 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800"
              aria-label="Open settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={handleReloadClick}
              className="h-9 w-9 rounded-lg bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700"
              aria-label="Refresh data"
            >
              <RefreshCcw className={`w-4 h-4 ${isSpinning ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 px-4 pb-3">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`${tabBase} ${activeTab === id ? tabActive : tabInactive}`}
              aria-current={activeTab === id ? "page" : undefined}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-64 md:shrink-0 md:min-h-screen md:sticky md:top-0 border-r border-gray-200 dark:border-slate-800 midnight:border-gray-900 bg-white dark:bg-slate-900 midnight:bg-black">
        <div className="px-5 py-5">
          <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">UniCC</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Student dashboard</div>
        </div>
        <nav className="px-3 space-y-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`${tabBase} ${activeTab === id ? tabActive : tabInactive}`}
              aria-current={activeTab === id ? "page" : undefined}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="mt-auto px-3 pb-5 space-y-2">
          <button
            onClick={() => setShowSettingsPage(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-800 midnight:border-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800"
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
          <button
            onClick={handleReloadClick}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
          >
            <RefreshCcw className={`w-4 h-4 ${isSpinning ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </aside>
    </>
  );
}
