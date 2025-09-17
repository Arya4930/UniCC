"use client";
import { useState, useEffect } from "react";
import DashboardContent from "./dashboard";
import Footer from "@/components/custom/Footer";

export default function LoginPage() {
  const getInitialDay = () => {
    const today = new Date().toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
    return (today === "SAT" || today === "SUN") ? "MON" : today;
  };

  const [attendanceData, setAttendanceData] = useState({});
  const [marksData, setMarksData] = useState({});
  const [GradesData, setGradesData] = useState({});
  const [ScheduleData, setScheduleData] = useState({});
  const [activeDay, setActiveDay] = useState(getInitialDay);
  const [activeTab, setActiveTab] = useState("attendance");
  const [attendancePercentage, setattendancePercentage] = useState(0);
  const [ODhoursData, setODhoursData] = useState({});
  const [ODhoursIsOpen, setODhoursIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [GradesDisplayIsOpen, setGradesDisplayIsOpen] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState("marks");

  function setAttendanceAndOD(attendance) {
    if (!attendance || !attendance.attendance) return;
    setAttendanceData(attendance);
    let totalClass = 0;
    let attendedClasses = 0;
    attendance.attendance.forEach(course => {
      totalClass += parseInt(course.totalClasses);
      attendedClasses += parseInt(course.attendedClasses);
    });
    setattendancePercentage(totalClass > 0 ? Math.round(attendedClasses * 10000 / totalClass) / 100 : 0);

    let ODList = {};
    attendance.attendance.forEach(course => {
      if (!course.viewLink || !Array.isArray(course.viewLink)) return;
      course.viewLink.forEach(day => {
        if (day.status === "On Duty") {
          if (!ODList[day.date]) {
            ODList[day.date] = [];
          }
          ODList[day.date].push(course.courseTitle);
        }
      });
    });
    ODList = Object.entries(ODList)
      .map(([date, courses]) => ({ date, courses }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    setODhoursData(ODList);
  }

  useEffect(() => {
    const storedAttendance = localStorage.getItem("attendance");
    const storedMarks = localStorage.getItem("marks");
    const storedGrades = localStorage.getItem("grades");
    const storedUsername = localStorage.getItem("username");
    const storedPassword = localStorage.getItem("password");
    const storedSchedule = localStorage.getItem("schedule");

    if (storedAttendance) {
      setAttendanceAndOD(JSON.parse(storedAttendance));
    }
    if (storedMarks) setMarksData(JSON.parse(storedMarks));
    if (storedSchedule) setScheduleData(JSON.parse(storedSchedule));
    if (storedGrades) setGradesData(JSON.parse(storedGrades));

    setIsLoggedIn(!!(storedUsername && storedPassword));
  }, []);
  
  const handleReloadRequest = () => {
    alert("Reload functionality is disabled in offline mode.");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {!isLoggedIn ? (
        <div className="flex-grow flex items-center justify-center p-4 text-center">
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-xl font-semibold text-gray-800">You are Offline</h1>
            <p className="text-gray-600 mt-2">Please connect to the internet to log in.</p>
          </div>
        </div>
      ) : (
        <DashboardContent
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          handleReloadRequest={handleReloadRequest}
          GradesData={GradesData}
          attendancePercentage={attendancePercentage}
          ODhoursData={ODhoursData}
          ODhoursIsOpen={ODhoursIsOpen}
          setODhoursIsOpen={setODhoursIsOpen}
          GradesDisplayIsOpen={GradesDisplayIsOpen}
          setGradesDisplayIsOpen={setGradesDisplayIsOpen}
          attendanceData={attendanceData}
          activeDay={activeDay}
          setActiveDay={setActiveDay}
          marksData={marksData}
          activeSubTab={activeSubTab}
          setActiveSubTab={setActiveSubTab}
          ScheduleData={ScheduleData}
        />
      )}
      <Footer />
    </div>
  );
}