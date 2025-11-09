'use client';
import { useState, useEffect } from "react";
import { ReloadModal } from "./reloadModel";
import LoginForm from "./loginForm";
import DashboardContent from "./Dashboard";
import Footer from "./Footer";
import { solveCaptchaClient } from "@/lib/solveCaptcha";
import config from '../../app/config.json'

export default function LoginPage() {
  // --- State Management ---
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [attendanceData, setAttendanceData] = useState({});
  const [marksData, setMarksData] = useState({});
  const [GradesData, setGradesData] = useState({});
  const [AllGradesData, setAllGradesData] = useState({});
  const [ScheduleData, setScheduleData] = useState({});
  const [hostelData, sethostelData] = useState({});
  const [Calender, setCalender] = useState({});
  const [activeDay, setActiveDay] = useState("");
  const [isReloading, setIsReloading] = useState(false);
  const [activeTab, setActiveTab] = useState("attendance");
  const [attendancePercentage, setattendancePercentage] = useState({});
  const [ODhoursData, setODhoursData] = useState({});
  const [ODhoursIsOpen, setODhoursIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [GradesDisplayIsOpen, setGradesDisplayIsOpen] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState("marks");
  const [HostelActiveSubTab, setHostelActiveSubTab] = useState("mess");
  const [activeAttendanceSubTab, setActiveAttendanceSubTab] = useState("attendance");
  const [isLoading, setIsLoading] = useState(true);
  const [CGPAHidden, setCGPAHidden] = useState(false);
  const [calendarType, setCalenderType] = useState(null)
  const [progressBar, setProgressBar] = useState(0);
  const [currSemesterID, setCurrSemesterID] = useState(config.semesterIDs[config.semesterIDs.length - 2]);

  useEffect(() => {
    const day = new Date().toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
    setActiveDay(day);
  }, []);

  function setAttendanceAndOD(attendance) {
    setAttendanceData(attendance);
    let totalClass = 0;
    let attendedClasses = 0;
    attendance.attendance.forEach(course => {
      totalClass += parseInt(course.totalClasses || 0);
      attendedClasses += parseInt(course.attendedClasses || 0);
    });
    setattendancePercentage({ "percentage": Math.round(attendedClasses * 10000 / totalClass) / 100, "str": `${attendedClasses}/${totalClass}` });

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
    const storedAllGrades = localStorage.getItem("allGrades");
    const storedUsername = localStorage.getItem("username");
    const storedPassword = localStorage.getItem("password");
    const storedSchedule = localStorage.getItem("schedule");
    const storedHoste = localStorage.getItem("hostel");
    const calendar = localStorage.getItem("calender");
    const calendarType = localStorage.getItem("calendarType");
    const currSemesterID = localStorage.getItem("currSemesterID");

    storedAttendance = JSON.parse(storedAttendance);
    if (storedAttendance && storedAttendance.attendance) {
      setAttendanceAndOD(storedAttendance);
    }
    if (storedMarks) setMarksData(JSON.parse(storedMarks));
    if (storedUsername) setUsername(storedUsername);
    if (storedPassword) setPassword(storedPassword);
    if (storedSchedule) setScheduleData(JSON.parse(storedSchedule));
    if (storedGrades) setGradesData(JSON.parse(storedGrades));
    if (storedAllGrades) setAllGradesData(JSON.parse(storedAllGrades));
    if (storedHoste) sethostelData(JSON.parse(storedHoste));
    if (calendar) setCalender(JSON.parse(calendar));
    if (calendarType) setCalenderType(calendarType);
    if (currSemesterID) setCurrSemesterID(currSemesterID);
    setIsLoggedIn((storedUsername && storedPassword) ? true : false);
    setTimeout(() => setIsLoading(false), 300);
  }, []);

  const loginToVTOP = async () => {
    setProgressBar(10);
    setMessage("Logging in and fetching leave history...");

    const captchaRes = await fetch("/api/getCaptcha", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    const { captchaBase64, cookies, csrf, error } = await captchaRes.json();
    if (error) throw new Error("Failed to get CAPTCHA: " + error);
    const captcha = await solveCaptchaClient(captchaBase64);
    const loginRes = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        password,
        captcha,
        cookies,
        csrf,
      }),
    });

    const data = await loginRes.json();
    if (!data.success || !data.dashboardHtml)
      throw new Error(data.message || "Login failed.");

    setMessage((prev) => prev + "\n✅ Login successful");
    setProgressBar((prev) => prev + 30);

    return {
      cookies: data.cookies,
      dashboardHtml: data.dashboardHtml,
    };
  };

  const handleLogin = async (currSemesterID = config.semesterIDs[config.semesterIDs.length - 2]) => {
    try {
      const { cookies, dashboardHtml } = await loginToVTOP();
      localStorage.setItem("username", username);
      localStorage.setItem("password", password);

      const [
        attRes,
        marksRes,
        gradesRes,
        ScheduleRes,
        HostelRes,
        calenderRes,
        allGradesRes
      ] = await Promise.all([
        fetch("/api/fetchAttendance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cookies: cookies, dashboardHtml: dashboardHtml, semesterId: currSemesterID }),
        }).then(async r => {
          const j = await r.json();
          setMessage(prev => prev + "\n✅ Attendance fetched");
          setProgressBar(prev => prev + 10);
          return j;
        }),

        fetch("/api/fetchMarks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cookies: cookies, dashboardHtml: dashboardHtml, semesterId: currSemesterID }),
        }).then(async r => {
          const j = await r.json();
          setMessage(prev => prev + "\n✅ Marks fetched");
          setProgressBar(prev => prev + 5);
          return j;
        }),

        fetch("/api/fetchGrades", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cookies: cookies, dashboardHtml: dashboardHtml, semesterId: currSemesterID }),
        }).then(async r => {
          const j = await r.json();
          setMessage(prev => prev + "\n✅ Grades fetched");
          setProgressBar(prev => prev + 5);
          return j;
        }),

        fetch("/api/fetchExamSchedule", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cookies: cookies, dashboardHtml: dashboardHtml, semesterId: currSemesterID }),
        }).then(async r => {
          const j = await r.json();
          setMessage(prev => prev + "\n✅ Exam schedule fetched");
          setProgressBar(prev => prev + 5);
          return j;
        }),

        fetch("/api/fetchHostelDetails", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cookies: cookies, dashboardHtml: dashboardHtml }),
        }).then(async r => {
          const j = await r.json();
          setMessage(prev => prev + "\n✅ Hostel details fetched");
          setProgressBar(prev => prev + 5);
          return j;
        }),

        fetch("/api/parseSemTT", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cookies: cookies,
            dashboardHtml: dashboardHtml,
            type: calendarType || "ALL",
            semesterId: currSemesterID
          }),
        }).then(async r => {
          const j = await r.json();
          setMessage(prev => prev + "\n✅ Calendar fetched");
          setProgressBar(prev => prev + 5);
          return j;
        }),
        fetch("/api/fetchAllGrades", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cookies: cookies, dashboardHtml: dashboardHtml }),
        }).then(async r => {
          const j = await r.json();
          setMessage(prev => prev + "\n✅ All grades fetched");
          setProgressBar(prev => prev + 10);
          return j;
        }),
      ]);

      setMessage(prev => prev + "\nFinalizing and saving data...");

      setAttendanceAndOD(attRes);
      setMarksData(marksRes);
      setGradesData(gradesRes);
      setAllGradesData(allGradesRes);
      setScheduleData(ScheduleRes);
      sethostelData(HostelRes);
      setCalender(calenderRes);

      localStorage.setItem("attendance", JSON.stringify(attRes));
      localStorage.setItem("marks", JSON.stringify(marksRes));
      localStorage.setItem("grades", JSON.stringify(gradesRes));
      localStorage.setItem("allGrades", JSON.stringify(allGradesRes));
      localStorage.setItem("schedule", JSON.stringify(ScheduleRes));
      localStorage.setItem("hostel", JSON.stringify(HostelRes));
      localStorage.setItem("calender", JSON.stringify(calenderRes));

      setMessage(prev => prev + "\n✅ All data loaded successfully!");
      setProgressBar(100);
      setIsLoggedIn(true);
      setIsReloading(false);
    } catch (err) {
      console.error(err);
      setMessage(prev => prev + "\n❌ Login failed, check console.");
      setProgressBar(0);
    }
  };

  // --- Event Handlers ---
  const handleReloadRequest = async () => {
    setIsReloading(true);
    try {
      const { cookies, dashboardHtml } = await loginToVTOP();
      localStorage.setItem("username", username);
      localStorage.setItem("password", password);

      const [
        attRes,
        marksRes
      ] = await Promise.all([
        fetch("/api/fetchAttendance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cookies: cookies, dashboardHtml: dashboardHtml, semesterId: currSemesterID }),
        }).then(async r => {
          const j = await r.json();
          setMessage(prev => prev + "\n✅ Attendance fetched");
          setProgressBar(prev => prev + 20);
          return j;
        }),
        fetch("/api/fetchMarks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cookies: cookies, dashboardHtml: dashboardHtml, semesterId: currSemesterID}),
        }).then(async r => {
          const j = await r.json();
          setMessage(prev => prev + "\n✅ Marks fetched");
          setProgressBar(prev => prev + 20);
          return j;
        })
      ]);

      setAttendanceAndOD(attRes);
      setMarksData(marksRes);

      localStorage.setItem("attendance", JSON.stringify(attRes));
      localStorage.setItem("marks", JSON.stringify(marksRes));

      setMessage(prev => prev + "\n✅ All data loaded successfully!");
      setProgressBar(100);
      setIsLoggedIn(true);
      setIsReloading(false);
    } catch (err) {
      console.error(err);
      setMessage(prev => prev + "\n❌ Login failed, check console.");
      setProgressBar(0);
    }
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
    localStorage.removeItem("allGrades");
    localStorage.removeItem("schedule");
    localStorage.removeItem("hostel");
    localStorage.removeItem("currSemesterID")
    setMessage("");
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!username || !password) {
      return alert("Please fill all the fields!");
    }
    handleLogin();
  };

  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 midnight:bg-black">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent border-gray-500"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading app...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 midnight:bg-black flex flex-col text-gray-900 dark:text-gray-100 midnight:text-gray-100 transition-colors">
      {isReloading && (
        <ReloadModal
          message={message}
          onClose={() => setIsReloading(false)}
          progressBar={progressBar}
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
            progressBar={progressBar}
          />
        </div>
      )}

      {isLoggedIn && (
        <>
          {isOffline && <div className="top-0 left-0 w-full bg-yellow-500 text-black text-center py-2 font-medium z-[9999] shadow-md">
            ⚠️ You’re currently offline. Some features may not work.
          </div>}
          <DashboardContent
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            handleLogOutRequest={handleLogOutRequest}
            handleReloadRequest={handleReloadRequest}
            GradesData={GradesData}
            allGradesData={AllGradesData}
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
            activeAttendanceSubTab={activeAttendanceSubTab}
            setActiveAttendanceSubTab={setActiveAttendanceSubTab}
            calendarData={Calender}
            CGPAHidden={CGPAHidden}
            setCGPAHidden={setCGPAHidden}
            calendarType={calendarType}
            setCalender={setCalender}
            setCalenderType={setCalenderType}
            setIsReloading={setIsReloading}
            setProgressBar={setProgressBar}
            setMessage={setMessage}
            loginToVTOP={loginToVTOP}
            setAllGradesData={setAllGradesData}
            sethostelData={sethostelData}
            setGradesData={setGradesData}
            setScheduleData={setScheduleData}
            currSemesterID={currSemesterID}
          />
        </>
      )}

      <Footer isLoggedIn={isLoggedIn} currSemesterID={currSemesterID} setCurrSemesterID={setCurrSemesterID} handleLogin={handleLogin} setIsReloading={setIsReloading} />
    </div>
  );
}
