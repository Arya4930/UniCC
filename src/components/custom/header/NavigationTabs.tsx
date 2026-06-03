"use client";
import { useState } from "react";
import { RefreshCcw, Settings, CalendarCheck, GraduationCap, Building } from "lucide-react";
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
  username,
  password,
  setPassword,
  settings,
  setSettings
}) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [showSettingsPage, setShowSettingsPage] = useState<boolean>(false);

  const handleReloadClick = async () => {
    setIsSpinning(true);
    await handleReloadRequest();
    setTimeout(() => setIsSpinning(false), 600);
  };

  const navItemClass = (isActive) => 
    `flex flex-col items-center justify-center w-full h-full py-2 space-y-1 transition-colors ${
      isActive 
        ? "text-blue-600 dark:text-blue-400 midnight:text-blue-400" 
        : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 midnight:text-gray-400 midnight:hover:text-gray-200"
    }`;

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
          password={password}
          username={username}
          setPassword={setPassword}
          decimalValues={settings.decimalValues}
          setDecimalValues={(val: boolean) => {
              setSettings(prev => ({ ...prev, decimalValues: val }))
              localStorage.setItem("settings", JSON.stringify({ ...settings, decimalValues: val }))
            }
          }
          loadingScreen={settings.loadingScreen}
          setLoadingScreen={(val: boolean) => {
              setSettings(prev => ({ ...prev, loadingScreen: val }))
              localStorage.setItem("settings", JSON.stringify({ ...settings, loadingScreen: val }))
            }
          }
        />
      )}

      {/* Bottom Navigation Bar for Mobile App Feel */}
      <div 
        className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around w-full bg-white dark:bg-slate-900 midnight:bg-black border-t border-gray-200 dark:border-gray-800 midnight:border-gray-900 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] safe-area-pb"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.5rem)', paddingTop: '0.5rem' }}
      >
        <button
          onClick={() => setActiveTab("attendance")}
          className={navItemClass(activeTab === "attendance")}
        >
          <CalendarCheck className="w-5 h-5" />
          <span className="text-[10px] font-medium">Attendance</span>
        </button>

        <button
          onClick={() => setActiveTab("exams")}
          className={navItemClass(activeTab === "exams")}
        >
          <GraduationCap className="w-5 h-5" />
          <span className="text-[10px] font-medium">Exams</span>
        </button>

        <button
          onClick={() => setActiveTab("hostel")}
          className={navItemClass(activeTab === "hostel")}
        >
          <Building className="w-5 h-5" />
          <span className="text-[10px] font-medium">Hostel</span>
        </button>

        <button
          onClick={handleReloadClick}
          className={navItemClass(false)}
        >
          <RefreshCcw className={`w-5 h-5 ${isSpinning ? "animate-spin" : ""}`} />
          <span className="text-[10px] font-medium">Reload</span>
        </button>

        <button
          onClick={() => setShowSettingsPage(true)}
          className={navItemClass(false)}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px] font-medium">Settings</span>
        </button>
      </div>
    </>
  );
}
