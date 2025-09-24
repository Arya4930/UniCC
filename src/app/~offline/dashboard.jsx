"use client";
import NavigationTabs from "./NavigationTabs";
import StatsCards from "@/components/custom/statCards";
import ODHoursModal from "@/components/custom/ODHoursModal";
import GradesModal from "@/components/custom/Exams/GradesModal";
import AttendanceTabs from "@/components/custom/attendance/attendanceTabs";
import ExamsSubTabs from "@/components/custom/Exams/ExamSubsTab";
import MarksDisplay from "@/components/custom/Exams/marksDislay";
import ScheduleDisplay from "@/components/custom/Exams/SchduleDisplay";

export default function DashboardContent({
  activeTab,
  setActiveTab,
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
}) {
  return (
    <div className="w-full max-w-md mx-auto">
      <NavigationTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleReloadRequest={handleReloadRequest}
      />

      <div className="bg-gray-50 min-h-screen">
        {GradesData && (
          <StatsCards
            attendancePercentage={attendancePercentage}
            ODhoursData={ODhoursData}
            setODhoursIsOpen={setODhoursIsOpen}
            GradesData={GradesData}
            setGradesDisplayIsOpen={setGradesDisplayIsOpen}
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

        <div className="px-4">
          {activeTab === "attendance" && attendanceData && attendanceData.attendance && (
            <AttendanceTabs
              data={attendanceData}
              activeDay={activeDay}
              setActiveDay={setActiveDay}
            />
          )}

          {activeTab === "exams" && marksData && (
            <div>
              <ExamsSubTabs
                activeSubTab={activeSubTab}
                setActiveSubTab={setActiveSubTab}
              />
              {activeSubTab === "marks" && <MarksDisplay data={marksData} />}
              {activeSubTab === "schedule" && <ScheduleDisplay data={ScheduleData} />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}