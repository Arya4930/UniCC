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
}) {
  return (
    <div className="w-full max-w-md md:max-w-full mx-auto">
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

        <div>
          {activeTab === "attendance" && attendanceData && attendanceData.attendance && (
            <>
              <AttendanceSubTabs
                activeSubTab={activeAttendanceSubTab}
                setActiveAttendanceSubTab={setActiveAttendanceSubTab}
              />
              {activeAttendanceSubTab === "attendance" && <AttendanceTabs data={attendanceData} activeDay={activeDay} setActiveDay={setActiveDay} calendars={calendarData.calendars} />}
              {activeAttendanceSubTab === "calendar" && <CalendarView calendars={calendarData.calendars} />}
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
    </div>
  );
}
