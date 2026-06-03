"use client";
import { useState } from "react";
import { RefreshCcw, Settings, CalendarCheck, GraduationCap, Building, Bus } from "lucide-react";
import SettingsPage from "./SettingsPage";
import Footer from "../footer/Footer";

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
  setGradesDisplayIsOpen,
  activeAttendanceSubTab,
  setActiveAttendanceSubTab,
  activeSubTab,
  setActiveSubTab,
  HostelActiveSubTab,
  setHostelActiveSubTab,
  activeDayscholarSubTab,
  setActiveDayscholarSubTab
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
          isDayscholarWithBus={settings.isDayscholarWithBus}
          setIsDayscholarWithBus={(val: boolean) => {
              setSettings(prev => ({ ...prev, isDayscholarWithBus: val }))
              localStorage.setItem("settings", JSON.stringify({ ...settings, isDayscholarWithBus: val }))
            }
          }
        />
      )}

      {/* Main Container */}
      <div 
        className="fixed bottom-0 md:top-4 left-0 right-0 md:left-4 md:right-auto z-40 flex items-center md:items-start justify-around md:justify-start w-full md:w-64 md:h-[calc(100vh-2rem)] md:flex-col bg-white dark:bg-slate-900 midnight:bg-black border-t md:border border-gray-200 dark:border-gray-800 midnight:border-gray-900 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] md:shadow-lg md:rounded-2xl safe-area-pb md:pb-0 overflow-y-auto"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)', scrollbarWidth: 'none' }}
      >
        {/* Desktop Sidebar Profile / Stats Area */}
        <div className="hidden md:flex flex-col w-full p-4 mb-2 border-b border-gray-200 dark:border-gray-800 midnight:border-gray-800 pt-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 midnight:text-white tracking-tight">UniCC</h2>
              <p className="text-xs text-gray-500 truncate max-w-[120px]">{username}</p>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={handleReloadClick}
                className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 midnight:hover:bg-gray-800 transition-colors"
                title="Reload Data"
              >
                <RefreshCcw className={`w-4 h-4 text-gray-600 dark:text-gray-300 ${isSpinning ? "animate-spin" : ""}`} />
              </button>
              <button 
                onClick={() => setShowSettingsPage(true)}
                className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 midnight:hover:bg-gray-800 transition-colors"
                title="Settings"
              >
                <Settings className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
          </div>
          
          {/* Compact Stats Grid - Small Cards */}
          <div className="grid grid-cols-2 gap-2 mb-2">
            {/* CGPA */}
            <div 
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-gray-50 dark:bg-gray-800/50 midnight:bg-gray-800/50 border border-gray-100 dark:border-gray-800 midnight:border-gray-700 cursor-pointer hover:shadow-sm transition-all group" 
              onClick={() => setSettings(prev => ({...prev, CGPAHidden: !prev.CGPAHidden}))}
            >
              <span className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5 font-medium">CGPA</span>
              <span className="font-bold text-sm text-gray-900 dark:text-gray-100 midnight:text-gray-100 group-hover:text-blue-500 transition-colors">
                {settings.CGPAHidden ? "###" : marksData?.cgpa?.cgpa || "-"}
              </span>
            </div>

            {/* Attendance */}
            <div 
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-gray-50 dark:bg-gray-800/50 midnight:bg-gray-800/50 border border-gray-100 dark:border-gray-800 midnight:border-gray-700 cursor-pointer hover:shadow-sm transition-all group"
              onClick={() => setSettings(prev => ({ ...prev, attendancePercentageOrString: prev.attendancePercentageOrString === "percentage" ? "str" : "percentage" }))}
            >
              <span className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5 font-medium">Att.</span>
              <span className={`font-bold text-sm ${attendancePercentage?.percentage < 75 ? "text-red-500" : "text-green-500 dark:text-green-400"}`}>
                {attendancePercentage?.[settings.attendancePercentageOrString] || "-"}
                {settings.attendancePercentageOrString === "percentage" ? "%" : ""}
              </span>
            </div>

            {/* OD Hours */}
            <div 
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-gray-50 dark:bg-gray-800/50 midnight:bg-gray-800/50 border border-gray-100 dark:border-gray-800 midnight:border-gray-700 cursor-pointer hover:shadow-sm transition-all group" 
              onClick={() => setODhoursIsOpen(true)}
            >
              <span className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5 font-medium">OD Hrs</span>
              <span className="font-bold text-sm text-gray-900 dark:text-gray-100 midnight:text-gray-100 group-hover:text-blue-500 transition-colors">
                {totalODHours}/40
              </span>
            </div>

            {/* Credits */}
            <div 
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-gray-50 dark:bg-gray-800/50 midnight:bg-gray-800/50 border border-gray-100 dark:border-gray-800 midnight:border-gray-700 cursor-pointer hover:shadow-sm transition-all group" 
              onClick={() => setGradesDisplayIsOpen(true)}
            >
              <span className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5 font-medium">Credits</span>
              <span className="font-bold text-sm text-gray-900 dark:text-gray-100 midnight:text-gray-100 group-hover:text-blue-500 transition-colors">
                {marksData?.cgpa ? Number(marksData.cgpa.creditsEarned) + Number(marksData.cgpa.nonGradedRequirement || 0) : "-"}
              </span>
            </div>
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
        {activeTab === "attendance" && (
          <div className="hidden md:flex flex-col w-full pl-12 pr-4 py-1 space-y-1 bg-white dark:bg-slate-900 midnight:bg-black">
            <button
              onClick={() => setActiveAttendanceSubTab("attendance")}
              className={`text-left text-sm py-1.5 transition-colors ${activeAttendanceSubTab === "attendance" ? "text-blue-600 dark:text-blue-400 midnight:text-blue-400 font-medium" : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 midnight:hover:text-gray-200"}`}
            >
              Attendance
            </button>
            <button
              onClick={() => setActiveAttendanceSubTab("calendar")}
              className={`text-left text-sm py-1.5 transition-colors ${activeAttendanceSubTab === "calendar" ? "text-blue-600 dark:text-blue-400 midnight:text-blue-400 font-medium" : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 midnight:hover:text-gray-200"}`}
            >
              Calendar
            </button>
          </div>
        )}

        <button
          onClick={() => setActiveTab("exams")}
          className={navItemClass(activeTab === "exams")}
        >
          <GraduationCap className="w-5 h-5 md:w-5 md:h-5" />
          <span className="text-[10px] md:text-sm font-medium">Exams</span>
        </button>
        {activeTab === "exams" && (
          <div className="hidden md:flex flex-col w-full pl-12 pr-4 py-1 space-y-1 bg-white dark:bg-slate-900 midnight:bg-black">
            <button
              onClick={() => setActiveSubTab("marks")}
              className={`text-left text-sm py-1.5 transition-colors ${activeSubTab === "marks" ? "text-blue-600 dark:text-blue-400 midnight:text-blue-400 font-medium" : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 midnight:hover:text-gray-200"}`}
            >
              Marks
            </button>
            <button
              onClick={() => setActiveSubTab("schedule")}
              className={`text-left text-sm py-1.5 transition-colors ${activeSubTab === "schedule" ? "text-blue-600 dark:text-blue-400 midnight:text-blue-400 font-medium" : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 midnight:hover:text-gray-200"}`}
            >
              Schedule
            </button>
            <button
              onClick={() => setActiveSubTab("grades")}
              className={`text-left text-sm py-1.5 transition-colors ${activeSubTab === "grades" ? "text-blue-600 dark:text-blue-400 midnight:text-blue-400 font-medium" : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 midnight:hover:text-gray-200"}`}
            >
              Grades
            </button>
          </div>
        )}

        {settings?.residentialStatus !== "dayscholar" && (
          <>
            <button
              onClick={() => setActiveTab("hostel")}
              className={navItemClass(activeTab === "hostel")}
            >
              <Building className="w-5 h-5 md:w-5 md:h-5" />
              <span className="text-[10px] md:text-sm font-medium">Hostel</span>
            </button>
            {activeTab === "hostel" && (
              <div className="hidden md:flex flex-col w-full pl-12 pr-4 py-1 space-y-1 bg-white dark:bg-slate-900 midnight:bg-black">
                <button
                  onClick={() => setHostelActiveSubTab("mess")}
                  className={`text-left text-sm py-1.5 transition-colors ${HostelActiveSubTab === "mess" ? "text-blue-600 dark:text-blue-400 midnight:text-blue-400 font-medium" : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 midnight:hover:text-gray-200"}`}
                >
                  Mess
                </button>
                <button
                  onClick={() => setHostelActiveSubTab("laundry")}
                  className={`text-left text-sm py-1.5 transition-colors ${HostelActiveSubTab === "laundry" ? "text-blue-600 dark:text-blue-400 midnight:text-blue-400 font-medium" : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 midnight:hover:text-gray-200"}`}
                >
                  Laundry
                </button>
                <button
                  onClick={() => setHostelActiveSubTab("leave")}
                  className={`text-left text-sm py-1.5 transition-colors ${HostelActiveSubTab === "leave" ? "text-blue-600 dark:text-blue-400 midnight:text-blue-400 font-medium" : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 midnight:hover:text-gray-200"}`}
                >
                  Leave
                </button>
              </div>
            )}
          </>
        )}

        {settings?.residentialStatus !== "hosteller" && (
          <>
            <button
              onClick={() => setActiveTab("dayscholar")}
              className={navItemClass(activeTab === "dayscholar")}
            >
              <Bus className="w-5 h-5 md:w-5 md:h-5" />
              <span className="text-[10px] md:text-sm font-medium">Dayscholar</span>
            </button>
            {activeTab === "dayscholar" && (
              <div className="hidden md:flex flex-col w-full pl-12 pr-4 py-1 space-y-1 bg-white dark:bg-slate-900 midnight:bg-black">
                <button
                  onClick={() => setActiveDayscholarSubTab("finder")}
                  className={`text-left text-sm py-1.5 transition-colors ${activeDayscholarSubTab === "finder" ? "text-blue-600 dark:text-blue-400 midnight:text-blue-400 font-medium" : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 midnight:hover:text-gray-200"}`}
                >
                  Bus Finder
                </button>
                <button
                  onClick={() => setActiveDayscholarSubTab("fees")}
                  className={`text-left text-sm py-1.5 transition-colors ${activeDayscholarSubTab === "fees" ? "text-blue-600 dark:text-blue-400 midnight:text-blue-400 font-medium" : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 midnight:hover:text-gray-200"}`}
                >
                  Fees & Info
                </button>
              </div>
            )}
          </>
        )}

        <div className="hidden md:block w-full flex-grow"></div>

        <button
          onClick={handleReloadClick}
          className={`${navItemClass(false)} md:hidden`}
        >
          <RefreshCcw className={`w-5 h-5 md:w-5 md:h-5 ${isSpinning ? "animate-spin" : ""}`} />
          <span className="text-[10px] md:text-sm font-medium">Reload Data</span>
        </button>

        <button
          onClick={() => setShowSettingsPage(true)}
          className={`${navItemClass(false)} md:hidden`}
        >
          <Settings className="w-5 h-5 md:w-5 md:h-5" />
          <span className="text-[10px] md:text-sm font-medium">Settings</span>
        </button>

        <div className="hidden md:block w-full mt-auto">
          <Footer isLoggedIn={true} variant="sidebar" />
        </div>
      </div>
    </>
  );
}
