"use client";
import { useState, useEffect } from "react";
import { ReloadModal } from "./reloadModel";
import LoginForm from "./loginForm";
import DashboardContent from "./Dashboard";
import Footer from "./Footer";
import PushNotificationManager from "@/app/pushNotificationManager";

export default function LoginPage() {
  const getInitialDay = () => {
    const today = new Date().toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
    return (today === "SAT" || today === "SUN") ? "MON" : today;
  };

  // --- State Management ---
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [attendanceData, setAttendanceData] = useState({});
  const [marksData, setMarksData] = useState({});
  const [GradesData, setGradesData] = useState({});
  const [ScheduleData, setScheduleData] = useState({});
  const [hostelData, sethostelData] = useState({});
  const [activeDay, setActiveDay] = useState(getInitialDay);
  const [isReloading, setIsReloading] = useState(false);
  const [activeTab, setActiveTab] = useState("attendance");
  const [attendancePercentage, setattendancePercentage] = useState(0);
  const [ODhoursData, setODhoursData] = useState({});
  const [ODhoursIsOpen, setODhoursIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [GradesDisplayIsOpen, setGradesDisplayIsOpen] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState("marks");
  const [HostelActiveSubTab, setHostelActiveSubTab] = useState("mess");

  function setAttendanceAndOD(attendance) {
    setAttendanceData(attendance);
    let totalClass = 0;
    let attendedClasses = 0;
    attendance.attendance.forEach(course => {
      totalClass += parseInt(course.totalClasses);
      attendedClasses += parseInt(course.attendedClasses);
    });
    setattendancePercentage(Math.round(attendedClasses * 10000 / totalClass) / 100);

    let ODList = {};
    attendance.attendance.forEach(course => {
      if (!course.viewLink || !Array.isArray(course.viewLink)) return;

      course.viewLink.forEach(day => {
        if (day.status === "On Duty") {
          if (!ODList[day.date]) {
            ODList[day.date] = [];
          }
          let hours = course.slotName.startsWith("L") ? 2 : 1;
          ODList[day.date].push({
            title: course.courseTitle,
            type: course.slotName.startsWith("L") ? "LAB" : "TH",
            hours
          });
        }
      });
    });
    ODList = Object.entries(ODList)
      .map(([date, courses]) => ({
        date,
        courses,
        total: courses.reduce((sum, c) => sum + c.hours, 0)
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    setODhoursData(ODList);
  }

  // --- Effects ---
  useEffect(() => {
    let storedAttendance = localStorage.getItem("attendance");
    const storedMarks = localStorage.getItem("marks");
    const storedGrades = localStorage.getItem("grades");
    const storedUsername = localStorage.getItem("username");
    const storedPassword = localStorage.getItem("password");
    const storedSchedule = localStorage.getItem("schedule");
    const storedHoste = localStorage.getItem("hostel");

    storedAttendance = JSON.parse(storedAttendance);
    if (storedAttendance && storedAttendance.attendance) {
      setAttendanceAndOD(storedAttendance);
    }
    if (storedMarks) setMarksData(JSON.parse(storedMarks));
    if (storedUsername) setUsername(storedUsername);
    if (storedPassword) setPassword(storedPassword);
    if (storedSchedule) setScheduleData(JSON.parse(storedSchedule));
    if (storedGrades) setGradesData(JSON.parse(storedGrades));
    if (storedHoste) sethostelData(JSON.parse(storedHoste));
    setIsLoggedIn((storedUsername && storedPassword) ? true : false);
  }, []);

  const handleLogin = async () => {
    setMessage("Logging in and fetching data...");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.success && data.dashboardHtml) {
        localStorage.setItem("username", username);
        localStorage.setItem("password", password);
        const [attRes, marksRes, gradesRes, ScheduleRes, HostelRes] = await Promise.all([
          fetch("/api/fetchAttendance", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cookies: data.cookies, dashboardHtml: data.dashboardHtml }),
          }),
          fetch("/api/fetchMarks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cookies: data.cookies, dashboardHtml: data.dashboardHtml }),
          }),
          fetch("/api/fetchGrades", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cookies: data.cookies, dashboardHtml: data.dashboardHtml }),
          }),
          fetch('/api/fetchExamSchedule', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cookies: data.cookies, dashboardHtml: data.dashboardHtml }),
          }),
          fetch('/api/fetchHostelDetails', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cookies: data.cookies, dashboardHtml: data.dashboardHtml }),
          })
        ]);

        const attData = await attRes.json();
        const marksDataPayload = await marksRes.json();
        const gradesDataPayload = await gradesRes.json();
        const ScheduleDataPayload = await ScheduleRes.json();
        const hostelRes = await HostelRes.json();

        setAttendanceAndOD(attData);
        setMarksData(marksDataPayload);
        setGradesData(gradesDataPayload);
        setScheduleData(ScheduleDataPayload);
        sethostelData(hostelRes);
        localStorage.setItem("attendance", JSON.stringify(attData));
        localStorage.setItem("marks", JSON.stringify(marksDataPayload));
        localStorage.setItem("grades", JSON.stringify(gradesDataPayload));
        localStorage.setItem("schedule", JSON.stringify(ScheduleDataPayload));
        localStorage.setItem("hostel", JSON.stringify(hostelRes));
        setIsReloading(false);
        setMessage("Data reloaded successfully!");
        setIsLoggedIn(true);
      } else {
        setMessage(data.message || "Login failed. Please try again.");
      }
    } catch (err) {
      setMessage("Login failed, check console.");
    }
  };

  // --- Event Handlers ---
  const handleReloadRequest = () => {
    setIsReloading(true);
    handleLogin();
  };

  const handleLogOutRequest = () => {
    setIsLoggedIn(false);
    setUsername("");
    setPassword("");
    localStorage.removeItem("username");
    localStorage.removeItem("password");
    setAttendanceData({});
    setMarksData({});
    setGradesData({});
    setScheduleData({});
    localStorage.removeItem("attendance");
    localStorage.removeItem("marks");
    localStorage.removeItem("grades");
    localStorage.removeItem("schedule");
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!username || !password) {
      return alert("Please fill all the fields!");
    }
    handleLogin();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 midnight:bg-black flex flex-col text-gray-900 dark:text-gray-100 midnight:text-gray-100 transition-colors">
      {isReloading && (
        <ReloadModal
          handleLogin={handleLogin}
          message={message}
          onClose={() => setIsReloading(false)}
        />
      )}

      {!isLoggedIn && (
        <div className="flex-grow flex items-center justify-center p-4">
          <LoginForm
            username={username}
            setUsername={setUsername}
            password={password}
            setPassword={setPassword}
            message={message}
            handleFormSubmit={handleFormSubmit}
          />
        </div>
      )}

      {isLoggedIn && (
        <DashboardContent
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          handleLogOutRequest={handleLogOutRequest}
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
          hostelData={hostelData}
          HostelActiveSubTab={HostelActiveSubTab}
          setHostelActiveSubTab={setHostelActiveSubTab}
        />
      )}

      <Footer />
    </div>
  );
}
