"use client";
import NavigationTabs from "./NavigationTabs";
import StatsCards from "./statCards";
import ODHoursModal from "./ODHoursModal";
import GradesModal from "./Exams/GradesModal";
import AttendanceTabs from "./attendance/attendanceTabs";
import ExamsSubTabs from "./Exams/ExamSubsTab";
import MarksDisplay from "./Exams/marksDislay";
import ScheduleDisplay from "./Exams/SchduleDisplay";
import HostelSubTabs from "./Hostel/HostelSubsTab";
import MessDisplay from "./Hostel/messDisplay";
import LaundryDisplay from "./Hostel/LaundryDisplay";
import AttendanceSubTabs from "./attendance/AttendanceSubsTabs";
import CalendarView from "./attendance/CalendarView";
import { useState } from "react";
import { useRef } from "react";

export default function DashboardContent({
  activeTab,
  setActiveTab,
  handleLogOutRequest,
  handleReloadRequest,
  GradesData,
  attendancePercentage,
  ODhoursData,
  ODhoursIsOpen,
  setODhoursIsOpen,
  GradesDisplayIsOpen,
  setGradesDisplayIsOpen,
  attendanceData,
  activeDay,
  setActiveDay,
  marksData,
  activeSubTab,
  setActiveSubTab,
  ScheduleData,
  hostelData,
  HostelActiveSubTab,
  setHostelActiveSubTab,
  activeAttendanceSubTab,
  setActiveAttendanceSubTab,
  calendarData,
  CGPAHidden,
  setCGPAHidden,
  calendarType,
  setCalendarType,
  handleCalendarFetch,
}) {
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const tabsOrder = ["attendance", "exams", "hostel"];

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const diff = touchStartX.current - touchEndX.current;
    console.log(diff)
    if (Math.abs(diff) < 75) return;

    const target = e.target.closest("[data-scrollable]");
    if (target) return;

    const currentIndex = tabsOrder.indexOf(activeTab);
    if (diff > 0 && currentIndex < tabsOrder.length - 1) {
      setActiveTab(tabsOrder[currentIndex + 1]);
    } else if (diff < 0 && currentIndex > 0) {
      setActiveTab(tabsOrder[currentIndex - 1]);
    }
  };

  return (
    <div
      className="w-full max-w-md md:max-w-full mx-auto overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <NavigationTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleLogOutRequest={handleLogOutRequest}
        handleReloadRequest={handleReloadRequest}
      />

      <div className="bg-gray-50 dark:bg-gray-900 midnight:bg-black min-h-screen text-gray-900 dark:text-gray-100 midnight:text-gray-100 transition-colors">
        {GradesData && (
          <StatsCards
            attendancePercentage={attendancePercentage}
            ODhoursData={ODhoursData}
            setODhoursIsOpen={setODhoursIsOpen}
            GradesData={GradesData}
            setGradesDisplayIsOpen={setGradesDisplayIsOpen}
            CGPAHidden={CGPAHidden}
            setCGPAHidden={setCGPAHidden}
          />
        )}

        {ODhoursIsOpen && (
          <ODHoursModal
            ODhoursData={ODhoursData}
            onClose={() => setODhoursIsOpen(false)}
          />
        )}

        {GradesDisplayIsOpen && (
          <GradesModal
            GradesData={GradesData}
            onClose={() => setGradesDisplayIsOpen(false)}
          />
        )}

        {activeTab === "attendance" && attendanceData?.attendance && (
          <>
            <AttendanceSubTabs
              activeSubTab={activeAttendanceSubTab}
              setActiveAttendanceSubTab={setActiveAttendanceSubTab}
            />

            {activeAttendanceSubTab === "attendance" && (
              <>
                {!calendarType && (
                  <CalendarTabWrapper
                    calendarType={calendarType}
                    setCalendarType={setCalendarType}
                    handleCalendarFetch={handleCalendarFetch}
                  />
                )}
                <AttendanceTabs
                  data={attendanceData}
                  activeDay={activeDay}
                  setActiveDay={setActiveDay}
                  calendars={calendarData.calendars}
                />
              </>
            )}

            {activeAttendanceSubTab === "calendar" && (
              <>
                <CalendarView
                  calendars={calendarData.calendars}
                  calendarType={calendarType}
                />
                <CalendarTabWrapper
                  calendarType={calendarType}
                  setCalendarType={setCalendarType}
                  handleCalendarFetch={handleCalendarFetch}
                />
              </>
            )}
          </>
        )}

        {activeTab === "exams" && marksData && (
          <>
            <ExamsSubTabs
              activeSubTab={activeSubTab}
              setActiveSubTab={setActiveSubTab}
            />
            {activeSubTab === "marks" && <MarksDisplay data={marksData} />}
            {activeSubTab === "schedule" && <ScheduleDisplay data={ScheduleData} />}
          </>
        )}

        {activeTab === "hostel" && (
          <>
            <HostelSubTabs
              HostelActiveSubTab={HostelActiveSubTab}
              setHostelActiveSubTab={setHostelActiveSubTab}
            />
            {HostelActiveSubTab === "mess" && <MessDisplay hostelData={hostelData} />}
            {HostelActiveSubTab === "laundry" && <LaundryDisplay hostelData={hostelData} />}
          </>
        )}
      </div>
    </div>
  );
}

function CalendarTabWrapper({ calendarType, setCalendarType, handleCalendarFetch }) {
  const CALENDAR_TYPES = {
    ALL: "General Semester",
    ALL02: "General Flexible",
    ALL03: "General Freshers",
    ALL05: "General LAW",
    ALL06: "Flexible Freshers",
    ALL08: "Cohort LAW",
    ALL11: "Flexible Research",
    WEI: "Weekend Intra Semester",
  };

  const [selectedType, setSelectedType] = useState(calendarType || "ALL");

  function handleSubmitCalendarType() {
    handleCalendarFetch(selectedType);
  }

  return (
    <div className="flex flex-col items-center justify-center gap-5 p-6 text-center">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 midnight:text-gray-100">
        Select Calendar Type
      </h2>

      <select
        value={selectedType}
        onChange={(e) => setSelectedType(e.target.value)}
        className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 
                   dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100
                   midnight:bg-[#0f172a] midnight:text-gray-100
                   focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
      >
        {Object.entries(CALENDAR_TYPES).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      <button
        onClick={handleSubmitCalendarType}
        className="px-6 py-2 rounded-md font-medium text-white bg-blue-600 hover:bg-blue-700 
                   dark:bg-blue-500 dark:hover:bg-blue-600
                   data-[theme=midnight]:bg-blue-500 data-[theme=midnight]:hover:bg-blue-600
                   transition-colors duration-150"
      >
        Submit
      </button>
    </div>
  );
}
