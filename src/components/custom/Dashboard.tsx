"use client";
import NavigationTabs from "./header/NavigationTabs";
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
import { API_BASE } from "./Main";
import CommandPalette from "./CommandPalette";
import { Button } from "@/components/ui/button";
import { Calendar, GraduationCap, LayoutGrid, RefreshCcw, UploadCloud, BedDouble } from "lucide-react";
import { useRouter } from "next/navigation";

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
  setScheduleData,
  currSemesterID,
  setCurrSemesterID,
  handleLogin,
  moodleData,
  setMoodleData
}) {
  const router = useRouter();
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
    try {
      const { cookies, authorizedID, csrf } = await loginToVTOP();

      const AllGradesRes = await fetch(`${API_BASE}/api/all-grades`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cookies: cookies, authorizedID, csrf }),
      });

      const AllGradesData = await AllGradesRes.json();
      setProgressBar((prev) => prev + 40);

      setAllGradesData(AllGradesData);
      localStorage.setItem("allGrades", JSON.stringify(AllGradesData));

      setMessage((prev) => prev + "\n✅ All grades reloaded successfully!");
      setProgressBar(100);
      setIsReloading(false);
    } catch (err) {
      console.error(err);
      setMessage("❌ All Grades fetch failed, check console.");
      setProgressBar(0);
    }
  };

  const handleCalendarFetch = async (FncalendarType) => {
    setIsReloading(true);
    try {
      const { cookies, authorizedID, csrf } = await loginToVTOP();

      const calenderRes = await fetch(`${API_BASE}/api/calendar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cookies: cookies,
          authorizedID, csrf,
          type: FncalendarType || "ALL",
          semesterId: currSemesterID
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
    setIsReloading(true);
    try {
      const { cookies, authorizedID, csrf } = await loginToVTOP();

      const gradesRes = await fetch(`${API_BASE}/api/grades`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cookies, authorizedID, csrf, semesterId: currSemesterID }),
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
    setIsReloading(true);
    try {
      const { cookies, authorizedID, csrf } = await loginToVTOP();

      const HostelRes = await fetch(`${API_BASE}/api/hostel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cookies: cookies, authorizedID, csrf }),
      });
      const HostelData = await HostelRes.json();
      setProgressBar((prev) => prev + 40);
      sethostelData(HostelData);
      localStorage.setItem("hostel", JSON.stringify(HostelData));
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
    setIsReloading(true);
    try {
      const { cookies, authorizedID, csrf } = await loginToVTOP();

      const ScheduleRes = await fetch(`${API_BASE}/api/schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cookies: cookies, authorizedID, csrf, semesterId: currSemesterID }),
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

  const handleFetchMoodle = async (username, pass) => {
    setIsReloading(true);
    setProgressBar(20);
    setMessage("Fetching Moodle data...");
    try {
      const moodleRes = await fetch(`${API_BASE}/api/lms-data`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, pass }),
      });

      const gradesData = await moodleRes.json();
      setProgressBar((prev) => prev + 40);

      setMoodleData(gradesData);
      localStorage.setItem("moodle", JSON.stringify(gradesData));

      setMessage((prev) => prev + "\n✅ Moodle Data fetched Successfully!");
      setProgressBar(100);
      setIsReloading(false);
    } catch (err) {
      console.error(err);
      setMessage("❌ Moodle Data fetch failed, check console.");
      setProgressBar(0);
    }
  };

  return (
    <div
      className="h-screen bg-gray-50 dark:bg-gray-950 midnight:bg-black text-gray-900 dark:text-gray-100 midnight:text-gray-100 overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <CommandPalette
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setActiveAttendanceSubTab={setActiveAttendanceSubTab}
        setActiveSubTab={setActiveSubTab}
        setHostelActiveSubTab={setHostelActiveSubTab}
        handleReloadRequest={handleReloadRequest}
        CGPAHidden={CGPAHidden}
        setCGPAHidden={setCGPAHidden}
      />
      <div className="flex h-screen flex-col md:flex-row">
        <NavigationTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          handleLogOutRequest={handleLogOutRequest}
          handleReloadRequest={handleReloadRequest}
          currSemesterID={currSemesterID}
          setCurrSemesterID={setCurrSemesterID}
          handleLogin={handleLogin}
          setIsReloading={setIsReloading}
        />

        <main className="flex-1 min-w-0 w-full overflow-y-auto">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-6 pb-16">
            <header className="mb-6 text-left">
              <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-gray-100">Dashboard</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Your academic snapshot with quick access to daily essentials.
              </p>
            </header>

            <section className="mb-8">
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
            </section>

            <section className="mb-8">
              <div className="rounded-2xl border border-gray-200 dark:border-slate-800 midnight:border-gray-900 bg-white dark:bg-slate-900 midnight:bg-black p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Quick actions</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Jump to key pages and tasks. Press Ctrl/Cmd + K for more.
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <Button variant="outline" onClick={() => setActiveTab("attendance")}>
                    <LayoutGrid className="w-4 h-4" /> Attendance
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setActiveTab("attendance");
                      setActiveAttendanceSubTab("calendar");
                    }}
                  >
                    <Calendar className="w-4 h-4" /> Calendar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setActiveTab("exams");
                      setActiveSubTab("marks");
                    }}
                  >
                    <GraduationCap className="w-4 h-4" /> Marks
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setActiveTab("hostel");
                      setHostelActiveSubTab("mess");
                    }}
                  >
                    <BedDouble className="w-4 h-4" /> Mess menu
                  </Button>
                  <Button variant="outline" onClick={handleReloadRequest}>
                    <RefreshCcw className="w-4 h-4" /> Refresh data
                  </Button>
                  <Button variant="outline" onClick={() => router.push("/upload")}>
                    <UploadCloud className="w-4 h-4" /> Upload files
                  </Button>
                </div>
              </div>
            </section>

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
              <section className="animate-fadeIn space-y-4">
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
              </section>
            )}

            {activeTab === "exams" && marksData && (
              <section className="animate-fadeIn space-y-4">
                <ExamsSubTabs
                  activeSubTab={activeSubTab}
                  setActiveSubTab={setActiveSubTab}
                />
                {activeSubTab === "marks" && (
                  <MarksDisplay data={marksData} moodleData={moodleData} handleFetchMoodle={handleFetchMoodle} />
                )}
                {activeSubTab === "schedule" && (
                  <ScheduleDisplay data={ScheduleData} handleScheduleFetch={handleScheduleFetch} />
                )}
                {activeSubTab === "grades" && (
                  <AllGradesDisplay data={allGradesData} handleAllGradesFetch={handleAllGradesFetch} />
                )}
              </section>
            )}

            {activeTab === "hostel" && (
              <section className="animate-fadeIn space-y-4">
                <HostelSubTabs
                  HostelActiveSubTab={HostelActiveSubTab}
                  setHostelActiveSubTab={setHostelActiveSubTab}
                />
                {HostelActiveSubTab === "mess" && (
                  <MessDisplay hostelData={hostelData} handleHostelDetailsFetch={handleHostelDetailsFetch} />
                )}
                {HostelActiveSubTab === "laundry" && (
                  <LaundryDisplay hostelData={hostelData} handleHostelDetailsFetch={handleHostelDetailsFetch} />
                )}
                {HostelActiveSubTab === "leave" && (
                  <LeaveDisplay leaveData={hostelData.leaveHistory} handleHostelDetailsFetch={handleHostelDetailsFetch} />
                )}
              </section>
            )}
          </div>
        </main>
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
