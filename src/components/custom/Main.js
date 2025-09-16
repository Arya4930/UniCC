"use client";
import { useState, useEffect } from "react";
import { ReloadModal } from "./reloadModel";
import LoginForm from "./loginForm";
import DashboardContent from "./Dashboard";
import Footer from "./Footer";

export default function LoginPage() {
  const getInitialDay = () => {
    const today = new Date().toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
    return (today === "SAT" || today === "SUN") ? "MON" : today;
  };

  // --- State Management ---
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [captchaImage, setCaptchaImage] = useState("");
  const [cookies, setCookies] = useState([]);
  const [message, setMessage] = useState("");
  const [attendanceData, setAttendanceData] = useState({});
  const [marksData, setMarksData] = useState({});
  const [GradesData, setGradesData] = useState({});
  const [ScheduleData, setScheduleData] = useState({});
  const [hostelData, sethostelData] = useState({});
  const [activeDay, setActiveDay] = useState(getInitialDay);
  const [csrf, setCsrf] = useState("");
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
          ODList[day.date].push(course.courseTitle);
        }
      });
    });
    ODList = Object.entries(ODList)
      .map(([date, courses]) => ({ date, courses }))
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

    if (!storedAttendance && !storedMarks) {
      loadCaptcha();
    }
  }, []);

  // --- API Functions ---
  const loadCaptcha = async () => {
    setMessage("Loading captcha...");
    try {
      let data;
      do {
        const res = await fetch("/api/getCaptcha");
        data = await res.json();
      } while (data.captchaType === "GRECAPTCHA");
      setCookies(Array.isArray(data.cookies) ? data.cookies : [data.cookies]);
      setCaptchaImage(data.captchaBase64);
      setCsrf(data.csrf);
      setMessage("");
    } catch (err) {
      setMessage("Failed to load captcha.");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!cookies.length) return alert("Cookies missing!");
    setMessage("Logging in and fetching data...");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, captcha, cookies, csrf }),
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
        setCaptchaImage("");
        setCaptcha("");
        setIsLoggedIn(true);
      } else {
        setMessage(data.message || "Login failed. Please try again.");
        setCaptcha("");
        loadCaptcha();
      }
    } catch (err) {
      setMessage("Login failed, check console.");
    }
  };

  // --- Event Handlers ---
  const handleReloadRequest = () => {
    setCaptcha("");
    setIsReloading(true);
    loadCaptcha();
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

  // --- Render Logic ---
  return (
    <div className="min-h-screen flex flex-col items-center mb-5">
      {isReloading && (
        <ReloadModal
          captchaImage={captchaImage}
          captcha={captcha}
          setCaptcha={setCaptcha}
          handleLogin={handleLogin}
          message={message}
          onClose={() => setIsReloading(false)}
        />
      )}

      {!isLoggedIn && (
        <LoginForm
          username={username}
          setUsername={setUsername}
          password={password}
          setPassword={setPassword}
          captcha={captcha}
          setCaptcha={setCaptcha}
          captchaImage={captchaImage}
          message={message}
          handleLogin={handleLogin}
        />
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