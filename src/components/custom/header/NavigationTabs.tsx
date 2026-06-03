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
  setSettings,
  attendancePercentage,
  marksData,
  ODhoursData,
  setODhoursIsOpen,
  feedbackStatus,
  setGradesDisplayIsOpen
}) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [showSettingsPage, setShowSettingsPage] = useState<boolean>(false);

  const totalODHours =
    ODhoursData && ODhoursData.length > 0 && ODhoursData[0].courses
      ? ODhoursData.reduce((sum, day) => sum + day.total, 0)
      : 0;

  const handleReloadClick = async () => {
    setIsSpinning(true);
    await handleReloadRequest();
    setTimeout(() => setIsSpinning(false), 600);
  };

  const navItemClass = (isActive) => 
    `flex flex-col md:flex-row items-center justify-center md:justify-start flex-1 md:flex-none w-full py-2 md:py-4 md:px-6 space-y-1 md:space-y-0 md:space-x-4 transition-colors cursor-pointer border-l-4 ${
      isActive 
        ? "text-blue-600 dark:text-blue-400 midnight:text-blue-400 md:bg-blue-50 dark:md:bg-slate-800/50 midnight:md:bg-gray-900/50 border-transparent md:border-blue-600 dark:md:border-blue-400" 
        : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 midnight:text-gray-400 midnight:hover:text-gray-200 border-transparent"
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

      {/* Responsive Navigation: Bottom Bar (Mobile) / Left Sidebar (Desktop) */}
      <div 
        className="fixed bottom-0 md:top-0 left-0 right-0 md:right-auto z-50 flex items-center md:items-start justify-around md:justify-start w-full md:w-64 md:h-[100dvh] md:flex-col bg-white dark:bg-slate-900 midnight:bg-black border-t md:border-t-0 md:border-r border-gray-200 dark:border-gray-800 midnight:border-gray-900 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] md:shadow-none safe-area-pb md:pb-0"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        {/* Desktop Sidebar Profile / Stats Area */}
        <div className="hidden md:flex flex-col w-full p-6 mb-4 border-b border-gray-200 dark:border-gray-800 midnight:border-gray-800 pt-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">UniCC</h2>
          <p className="text-sm text-gray-500 mb-6">{username}</p>
          
          <div className="flex justify-between items-center mb-3 group cursor-pointer" onClick={() => setSettings(prev => ({...prev, CGPAHidden: !prev.CGPAHidden}))}>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider group-hover:text-blue-500 transition-colors">CGPA</span>
            <span className="font-semibold text-sm group-hover:text-blue-500 transition-colors">
              {settings.CGPAHidden ? "###" : marksData?.cgpa?.cgpa || "-"}
            </span>
          </div>
          
          <div className="flex justify-between items-center mb-3 group cursor-pointer" onClick={() => setSettings(prev => ({ ...prev, attendancePercentageOrString: prev.attendancePercentageOrString === "percentage" ? "str" : "percentage" }))}>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider group-hover:text-blue-500 transition-colors">Attendance</span>
            <span className="font-semibold text-sm group-hover:text-blue-500 transition-colors">
              {attendancePercentage?.[settings.attendancePercentageOrString] || "-"}
            </span>
          </div>

          <div className="flex justify-between items-center mb-3 group cursor-pointer" onClick={() => setODhoursIsOpen(true)}>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider group-hover:text-blue-500 transition-colors">OD Hours</span>
            <span className="font-semibold text-sm group-hover:text-blue-500 transition-colors">
              {totalODHours}/40
            </span>
          </div>

          <div className="flex justify-between items-center mb-3 group cursor-pointer" onClick={() => setGradesDisplayIsOpen(true)}>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider group-hover:text-blue-500 transition-colors">Credits</span>
            <span className="font-semibold text-sm group-hover:text-blue-500 transition-colors">
              {marksData?.cgpa ? Number(marksData.cgpa.creditsEarned) + Number(marksData.cgpa.nonGradedRequirement || 0) : "-"}
            </span>
          </div>

          {feedbackStatus && (
            <div className="flex flex-col mt-2 pt-3 border-t border-gray-100 dark:border-gray-800 midnight:border-gray-800">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Feedback</span>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-gray-500">Mid Sem</span>
                <span className={`text-[11px] font-bold ${feedbackStatus?.MidSem?.Curriculum && feedbackStatus?.MidSem?.Course ? "text-green-500" : "text-red-500"}`}>
                  {feedbackStatus?.MidSem?.Curriculum && feedbackStatus?.MidSem?.Course ? "Given" : "Pending"}
                </span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-[10px] text-gray-500">End Sem</span>
                <span className={`text-[11px] font-bold ${feedbackStatus?.EndSem?.Curriculum && feedbackStatus?.EndSem?.Course ? "text-green-500" : "text-red-500"}`}>
                  {feedbackStatus?.EndSem?.Curriculum && feedbackStatus?.EndSem?.Course ? "Given" : "Pending"}
                </span>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => setActiveTab("attendance")}
          className={navItemClass(activeTab === "attendance")}
        >
          <CalendarCheck className="w-5 h-5 md:w-5 md:h-5" />
          <span className="text-[10px] md:text-sm font-medium">Attendance</span>
        </button>

        <button
          onClick={() => setActiveTab("exams")}
          className={navItemClass(activeTab === "exams")}
        >
          <GraduationCap className="w-5 h-5 md:w-5 md:h-5" />
          <span className="text-[10px] md:text-sm font-medium">Exams</span>
        </button>

        <button
          onClick={() => setActiveTab("hostel")}
          className={navItemClass(activeTab === "hostel")}
        >
          <Building className="w-5 h-5 md:w-5 md:h-5" />
          <span className="text-[10px] md:text-sm font-medium">Hostel</span>
        </button>

        <div className="hidden md:block w-full flex-grow"></div>

        <button
          onClick={handleReloadClick}
          className={navItemClass(false)}
        >
          <RefreshCcw className={`w-5 h-5 md:w-5 md:h-5 ${isSpinning ? "animate-spin" : ""}`} />
          <span className="text-[10px] md:text-sm font-medium">Reload Data</span>
        </button>

        <button
          onClick={() => setShowSettingsPage(true)}
          className={navItemClass(false)}
        >
          <Settings className="w-5 h-5 md:w-5 md:h-5" />
          <span className="text-[10px] md:text-sm font-medium">Settings</span>
        </button>
      </div>
    </>
  );
}
