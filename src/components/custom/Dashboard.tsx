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
import LeaveDisplay from "./Hostel/LeaveDisplay";
import AllGradesDisplay from "./Exams/AllGradesDisplay";

export default function DashboardContent({
  activeTab,
  setActiveTab,
  handleLogOutRequest,
  handleReloadRequest,
  GradesData,
  allGradesData,
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
  setCalender,
  setCalenderType,
  setIsReloading,
  setProgressBar,
  setMessage,
  loginToVTOP,
  setAllGradesData,
  sethostelData,
  setGradesData,
  setScheduleData
}) {
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchEndX = useRef(0);
  const touchEndY = useRef(0);
  const hasMoved = useRef(false);

  const tabsOrder = ["attendance", "exams", "hostel"];

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
    hasMoved.current = false;
  };

  const handleTouchMove = (e) => {
    const touch = e.touches[0];
    touchEndX.current = touch.clientX;
    touchEndY.current = touch.clientY;

    const diffX = Math.abs(touchStartX.current - touchEndX.current);
    const diffY = Math.abs(touchStartY.current - touchEndY.current);

    if (diffX > diffY && diffX > 10) hasMoved.current = true;
  };

  const handleTouchEnd = (e) => {
    if (!hasMoved.current) return;

    const diffX = touchStartX.current - touchEndX.current;
    const diffY = touchStartY.current - touchEndY.current;

    if (Math.abs(diffY) > Math.abs(diffX)) return;

    const target = e.target.closest("button, a, input, textarea, select, [data-prevent-swipe]");
    if (target) return;

    const scrollable = e.target.closest("[data-scrollable], [style*='overflow-x']");
    if (scrollable) return;

    if (Math.abs(diffX) < 75) return;

    const currentIndex = tabsOrder.indexOf(activeTab);
    if (diffX > 0 && currentIndex < tabsOrder.length - 1) {
      setActiveTab(tabsOrder[currentIndex + 1]);
    } else if (diffX < 0 && currentIndex > 0) {
      setActiveTab(tabsOrder[currentIndex - 1]);
    }
  };

  const handleAllGradesFetch = async () => {
    setIsReloading(true);
    setProgressBar(10);
    setMessage("Logging in and fetching data...");

    try {
      const { cookies, dashboardHtml } = await loginToVTOP();

      const AllGradesRes = await fetch("/api/fetchAllGrades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cookies: cookies, dashboardHtml: dashboardHtml }),
      });

      const AllGradesData = await AllGradesRes.json();
      setProgressBar((prev) => prev + 40);

      setAllGradesData(AllGradesData);
      localStorage.setItem("allGradesData", JSON.stringify(AllGradesData));

      setMessage((prev) => prev + "\n✅ All grades reloaded successfully!");
      setProgressBar(100);
      setIsReloading(false);
    } catch (err) {
      console.error(err);
      setMessage("❌ Calendar fetch failed, check console.");
      setProgressBar(0);
    }
  };

  const reloadLeaveHistory = async () => {
    try {
      const { cookies, dashboardHtml } = await loginToVTOP();

      const hostelRes = await fetch("/api/fetchHostelDetails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cookies: cookies,
          dashboardHtml: dashboardHtml,
        }),
      });

      const HostelRes = await hostelRes.json();
      setProgressBar((prev) => prev + 40);

      sethostelData(HostelRes);
      localStorage.setItem("hostelData", JSON.stringify(HostelRes));

      setMessage((prev) => prev + "\n✅ Leave history reloaded successfully!");
      setProgressBar(100);
      setIsReloading(false);
    } catch (err) {
      console.error(err);
      setMessage("❌ Leave history reload failed, check console.");
      setProgressBar(0);
    }
  };

  const handleCalendarFetch = async (FncalendarType) => {
    try {
      const { cookies, dashboardHtml } = await loginToVTOP();

      const calenderRes = await fetch("/api/parseSemTT", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cookies: cookies,
          dashboardHtml: dashboardHtml,
          type: FncalendarType || "ALL",
        }),
      });

      const CalenderRes = await calenderRes.json();
      setProgressBar((prev) => prev + 40);

      setCalender(CalenderRes);
      setCalenderType(FncalendarType);
      localStorage.setItem("calender", JSON.stringify(CalenderRes));
      localStorage.setItem("calendarType", FncalendarType);

      setMessage((prev) => prev + "\n✅ Calendar reloaded successfully!");
      setProgressBar(100);
      setIsReloading(false);
    } catch (err) {
      console.error(err);
      setMessage("❌ Calendar fetch failed, check console.");
      setProgressBar(0);
    }
  };

  const handleFetchGrades = async () => {
    try {
      const { cookies, dashboardHtml } = await loginToVTOP();

      const gradesRes = await fetch("/api/fetchGrades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cookies, dashboardHtml }),
      });

      const gradesData = await gradesRes.json();
      setProgressBar((prev) => prev + 40);

      setGradesData(gradesData);
      localStorage.setItem("grades", JSON.stringify(gradesData));

      setMessage((prev) => prev + "\n✅ Grades reloaded successfully!");
      setProgressBar(100);
      setIsReloading(false);
    } catch (err) {
      console.error(err);
      setMessage("❌ Grades fetch failed, check console.");
      setProgressBar(0);
    }
  };

  const handleHostelDetailsFetch = async () => {
    try {
      const { cookies, dashboardHtml } = await loginToVTOP();

      const HostelRes = await fetch("/api/fetchHostelDetails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cookies: cookies, dashboardHtml: dashboardHtml }),
      });
      const HostelData = await HostelRes.json();
      setProgressBar((prev) => prev + 40);
      sethostelData(HostelData);
      localStorage.setItem("hostelData", JSON.stringify(HostelData));
      setMessage((prev) => prev + "\n✅ Hostel details reloaded successfully!");
      setProgressBar(100);
      setIsReloading(false);
    } catch (err) {
      console.error(err);
      setMessage("❌ Hostel details fetch failed, check console.");
      setProgressBar(0);
    }
  };

  const handleScheduleFetch = async () => {
    try {
      const { cookies, dashboardHtml } = await loginToVTOP();

      const ScheduleRes = await fetch("/api/fetchExamSchedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cookies: cookies, dashboardHtml: dashboardHtml }),
      });
      const ScheduleData = await ScheduleRes.json();
      setProgressBar((prev) => prev + 40);
      setScheduleData(ScheduleData);
      localStorage.setItem("schedule", JSON.stringify(ScheduleData));
      setMessage((prev) => prev + "\n✅ Schedule reloaded successfully!");
      setProgressBar(100);
      setIsReloading(false);
    } catch (err) {
      console.error(err);
      setMessage("❌ Schedule fetch failed, check console.");
      setProgressBar(0);
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
        hostelData={hostelData}
      />

      <div className="bg-gray-50 dark:bg-gray-900 midnight:bg-black min-h-screen text-gray-900 dark:text-gray-100 midnight:text-gray-100 transition-colors">
        <StatsCards
          attendancePercentage={attendancePercentage}
          ODhoursData={ODhoursData}
          setODhoursIsOpen={setODhoursIsOpen}
          feedbackStatus={GradesData.feedback}
          marksData={marksData}
          setGradesDisplayIsOpen={setGradesDisplayIsOpen}
          CGPAHidden={CGPAHidden}
          setCGPAHidden={setCGPAHidden}
        />

        {ODhoursIsOpen && (
          <ODHoursModal
            ODhoursData={ODhoursData}
            onClose={() => setODhoursIsOpen(false)}
          />
        )}

        {GradesDisplayIsOpen && (
          <GradesModal
            GradesData={GradesData}
            marksData={marksData}
            onClose={() => setGradesDisplayIsOpen(false)}
            handleFetchGrades={handleFetchGrades}
            attendance={attendanceData.attendance}
          />
        )}

        {activeTab === "attendance" && attendanceData?.attendance && (
          <div className="animate-fadeIn">
            <AttendanceSubTabs
              activeSubTab={activeAttendanceSubTab}
              setActiveAttendanceSubTab={setActiveAttendanceSubTab}
            />

            {activeAttendanceSubTab === "attendance" && (
              <>
                {!calendarType && (
                  <CalendarTabWrapper
                    calendarType={calendarType}
                    handleCalendarFetch={handleCalendarFetch}
                  />
                )}
                <AttendanceTabs
                  data={attendanceData}
                  activeDay={activeDay}
                  setActiveDay={setActiveDay}
                  calendars={calendarData.calendars}
                  is9Pointer={marksData?.cgpa?.cgpa >= 9.0}
                />
              </>
            )}

            {activeAttendanceSubTab === "calendar" && (
              <>
                <CalendarView
                  calendars={calendarData.calendars}
                  calendarType={calendarType}
                  handleCalendarFetch={handleCalendarFetch}
                />
                <CalendarTabWrapper
                  calendarType={calendarType}
                  handleCalendarFetch={handleCalendarFetch}
                />
              </>
            )}
          </div>
        )}

        {activeTab === "exams" && marksData && (
          <div className="animate-fadeIn">
            <ExamsSubTabs
              activeSubTab={activeSubTab}
              setActiveSubTab={setActiveSubTab}
            />
            {activeSubTab === "marks" && <MarksDisplay data={marksData} />}
            {activeSubTab === "schedule" && <ScheduleDisplay data={ScheduleData} handleScheduleFetch={handleScheduleFetch} />}
            {activeSubTab === "grades" && <AllGradesDisplay data={allGradesData} handleAllGradesFetch={handleAllGradesFetch} />}
          </div>
        )}

        {activeTab === "hostel" && (
          <div className="animate-fadeIn">
            <HostelSubTabs
              HostelActiveSubTab={HostelActiveSubTab}
              setHostelActiveSubTab={setHostelActiveSubTab}
              hostelData={hostelData}
            />
            {HostelActiveSubTab === "mess" && <MessDisplay hostelData={hostelData} handleHostelDetailsFetch={handleHostelDetailsFetch} />}
            {HostelActiveSubTab === "laundry" && <LaundryDisplay hostelData={hostelData} handleHostelDetailsFetch={handleHostelDetailsFetch} />}
            {HostelActiveSubTab === "leave" && <LeaveDisplay leaveData={hostelData.leaveHistory} reloadLeaveHistory={reloadLeaveHistory} handleHostelDetailsFetch={handleHostelDetailsFetch} />}
          </div>
        )}
      </div>
    </div>
  );
}

function CalendarTabWrapper({ calendarType, handleCalendarFetch }) {
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
