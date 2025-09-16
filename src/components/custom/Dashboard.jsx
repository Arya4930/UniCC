"use client";
import NavigationTabs from "./NavigationTabs";
import StatsCards from "./statCards";
import ODHoursModal from "./ODHoursModal";
import GradesModal from "./GradesModal";
import AttendanceTabs from "./attendanceTabs";
import ExamsSubTabs from "./ExamSubsTab";
import MarksDisplay from "./marksDislay";
import ScheduleDisplay from "./SchduleDisplay";
import HostelSubTabs from "./HostelSubsTab";
import MessDisplay from "./messDisplay";
import LaundryDisplay from "./LaundryDisplay";

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
  setHostelActiveSubTab
}) {
  return (
    <div className="w-full max-w-md mx-auto">
      <NavigationTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleLogOutRequest={handleLogOutRequest}
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

        {/* OD Hours Modal */}
        {ODhoursIsOpen && (
          <ODHoursModal
            ODhoursData={ODhoursData}
            onClose={() => setODhoursIsOpen(false)}
          />
        )}

        {/* Grades Modal */}
        {GradesDisplayIsOpen && (
          <GradesModal
            GradesData={GradesData}
            onClose={() => setGradesDisplayIsOpen(false)}
          />
        )}

        <div className="px-4">
          {/* Attendance Tab Content */}
          {activeTab === "attendance" && attendanceData && attendanceData.attendance && (
            <AttendanceTabs 
              data={attendanceData} 
              activeDay={activeDay} 
              setActiveDay={setActiveDay} 
            />
          )}

          {/* Exams Tab Content */}
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

          {/* Hostel Tab Content */}
          {activeTab === "hostel" && (
            <div>
              <HostelSubTabs
                HostelActiveSubTab={HostelActiveSubTab}
                setHostelActiveSubTab={setHostelActiveSubTab}
              />
              {HostelActiveSubTab === "mess" && <MessDisplay hostelData={hostelData} />}
              {HostelActiveSubTab === "laundry" && <LaundryDisplay hostelData={hostelData} />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}