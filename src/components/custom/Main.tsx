'use client';
import { useState, useEffect } from "react";
import { ReloadModal } from "./reloadModel";
import LoginForm from "./loginForm";
import DashboardContent from "./Dashboard";
import Footer from "./footer/Footer";
import config from '../../app/config.json'
import { attendanceRes, ODListItem, ODListRaw } from "@/types/data/attendance";
import { AllGradesRes } from "@/types/data/allgrades";
import { loadActivityTree, saveActivityTree } from "@/lib/activit-tree";
import demoData from '../../app/demoData.json';

export const API_BASE =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://api.uni-cc.site";

export default function LoginPage() {
  // --- State Management ---
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [attendanceData, setAttendanceData] = useState<attendanceRes | null>({});
  const [marksData, setMarksData] = useState<object>({});
  const [GradesData, setGradesData] = useState<object>({});
  const [AllGradesData, setAllGradesData] = useState<AllGradesRes>({});
  const [ScheduleData, setScheduleData] = useState<object>({});
  const [hostelData, sethostelData] = useState<object>({});
  const [Calender, setCalender] = useState<object>({});
  const [activeDay, setActiveDay] = useState<string>("");
  const [isReloading, setIsReloading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("attendance");
  const [attendancePercentage, setattendancePercentage] = useState<object>({});
  const [ODhoursData, setODhoursData] = useState<object>({});
  const [ODhoursIsOpen, setODhoursIsOpen] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [GradesDisplayIsOpen, setGradesDisplayIsOpen] = useState<boolean>(false);
  const [activeSubTab, setActiveSubTab] = useState<string>("marks");
  const [HostelActiveSubTab, setHostelActiveSubTab] = useState<string>("mess");
  const [activeAttendanceSubTab, setActiveAttendanceSubTab] = useState<string>("attendance");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [CGPAHidden, setCGPAHidden] = useState<boolean>(false);
  const [calendarType, setCalenderType] = useState<string | null>(null)
  const [progressBar, setProgressBar] = useState<number>(0);
  const [currSemesterID, setCurrSemesterID] = useState<string>(config.semesterIDs[config.semesterIDs.length - 2]);
  const [moodleData, setMoodleData] = useState([]);
  const [isAPIworking, setIsAPIworking] = useState<boolean>(false);
  const [demoMode, setDemoMode] = useState<boolean>(false);

  useEffect(() => {
    const day = new Date().toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
    setActiveDay(day);

    const checkAPIStatus = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/status`);
        const data = await res.json();
        setIsAPIworking(data.text === "API is working" ? false : true);
      } catch (err) {
        setIsAPIworking(true);
      }
    }
    checkAPIStatus();
  }, []);

  function setAttendanceAndOD(attendance: attendanceRes): void {
    setAttendanceData(attendance);
    let totalClass = 0;
    let attendedClasses = 0;
    attendance.attendance?.forEach(course => {
      totalClass += course.totalClasses || 0;
      attendedClasses += course.attendedClasses || 0;
    });
    setattendancePercentage({ "percentage": Math.round(attendedClasses * 10000 / totalClass) / 100, "str": `${attendedClasses}/${totalClass}` });

    let ODList: ODListRaw = {};
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
    const formattedList: ODListItem[] = Object.entries(ODList)
      .map(([date, courses]) => ({
        date,
        courses,
        total: courses.reduce((sum, c) => sum + c.hours, 0)
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setODhoursData(formattedList);
  }

  // --- Effects ---
  useEffect(() => {
    const storedAttendance = localStorage.getItem("attendance");
    const storedMarks = localStorage.getItem("marks");
    const storedGrades = localStorage.getItem("grades");
    const storedAllGrades = localStorage.getItem("allGrades");
    const storedUsername = localStorage.getItem("username");
    const storedPassword = localStorage.getItem("password");
    const storedSchedule = localStorage.getItem("schedule");
    const storedHoste = localStorage.getItem("hostel");
    const calendar = localStorage.getItem("calender");
    const calendarType = localStorage.getItem("calendarType");
    const storedCurrSemesterID = localStorage.getItem("currSemesterID");
    const MoodleData = localStorage.getItem("moodleData");

    const parsedStoredAttendance: attendanceRes | null = storedAttendance ? JSON.parse(storedAttendance) : null;
    if (parsedStoredAttendance && parsedStoredAttendance.attendance) {
      setAttendanceAndOD(parsedStoredAttendance);
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
    if (storedCurrSemesterID) setCurrSemesterID(storedCurrSemesterID);
    if (MoodleData) setMoodleData(JSON.parse(MoodleData));
    setIsLoggedIn((storedUsername && storedPassword) ? true : false);
    setTimeout(() => setIsLoading(false), 300);
  }, []);

  const loginToVTOP = async (retry = false) => {
    try {
      setProgressBar(10);
      setMessage("Logging in and fetching data...");
      const loginRes = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password
        }),
      });

      const data = await loginRes.json();

      if (data.message?.includes("Invalid Captcha") && !retry) {
        console.warn("Invalid Captcha. Retrying once...");
        return await loginToVTOP(true);
      }

      if (!data.success || !data.authorizedID || !data.cookies)
        throw new Error(data.message || "Login failed.");

      setMessage((prev) => prev + "\n✅ Login successful");
      setProgressBar((prev) => prev + 30);

      return {
        cookies: data.cookies,
        authorizedID: data.authorizedID,
        csrf: data.csrf,
      };
    } catch (err: any) {
      throw err;
    }
  };

  const handleLogin = async (currSemesterID = config.semesterIDs[config.semesterIDs.length - 2]) => {
    try {
      const { cookies, authorizedID, csrf } = await loginToVTOP();
      localStorage.setItem("username", username);
      localStorage.setItem("password", password);

      const [
        { attRes, marksRes },
        gradesRes,
        ScheduleRes,
        HostelRes,
        calenderRes,
        allGradesRes
      ] = await Promise.all([
        fetch(`${API_BASE}/api/attendance`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cookies: cookies, authorizedID, csrf, semesterId: currSemesterID }),
        }).then(async r => {
          const j = await r.json();
          setMessage(prev => prev + "\n✅ Attendance/Marks fetched");
          setProgressBar(prev => prev + 10);
          return j;
        }),

        fetch(`${API_BASE}/api/grades`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cookies: cookies, authorizedID, csrf, semesterId: currSemesterID }),
        }).then(async r => {
          const j = await r.json();
          setMessage(prev => prev + "\n✅ Grades fetched");
          setProgressBar(prev => prev + 5);
          return j;
        }),

        fetch(`${API_BASE}/api/schedule`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cookies: cookies, authorizedID, csrf, semesterId: currSemesterID }),
        }).then(async r => {
          const j = await r.json();
          setMessage(prev => prev + "\n✅ Exam schedule fetched");
          setProgressBar(prev => prev + 5);
          return j;
        }),

        fetch(`${API_BASE}/api/hostel`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cookies: cookies, authorizedID, csrf }),
        }).then(async r => {
          const j = await r.json();
          setMessage(prev => prev + "\n✅ Hostel details fetched");
          setProgressBar(prev => prev + 5);
          return j;
        }),

        fetch(`${API_BASE}/api/calendar`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cookies: cookies,
            authorizedID, csrf,
            type: calendarType || "ALL",
            semesterId: currSemesterID
          }),
        }).then(async r => {
          const j = await r.json();
          setMessage(prev => prev + "\n✅ Calendar fetched");
          setProgressBar(prev => prev + 5);
          return j;
        }),
        fetch(`${API_BASE}/api/all-grades`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cookies: cookies, authorizedID, csrf }),
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

      const tree = loadActivityTree();
      tree.increment();
      saveActivityTree(tree);

      return true;
    } catch (err) {
      console.error(err);
      setMessage(prev => prev + "\n❌ Login failed, check console.");
      setProgressBar(0);
      throw err;
    }
  };

  // --- Event Handlers ---
  const handleReloadRequest = async () => {
    setIsReloading(true);
    try {
      const { cookies, authorizedID, csrf } = await loginToVTOP();
      localStorage.setItem("username", username);
      localStorage.setItem("password", password);

      const [
        { attRes, marksRes }
      ] = await Promise.all([
        fetch(`${API_BASE}/api/attendance`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cookies: cookies, authorizedID, csrf, semesterId: currSemesterID }),
        }).then(async r => {
          const j = await r.json();
          setMessage(prev => prev + "\n✅ Attendance/Marks fetched");
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

      const tree = loadActivityTree();
      tree.increment();
      saveActivityTree(tree);
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

    const keysToKeep = ["theme", "CGPAHidden", "activityTree"];

    const saved: Record<string, string | null> = {};
    keysToKeep.forEach((key) => {
      saved[key] = localStorage.getItem(key);
    });

    localStorage.clear();

    keysToKeep.forEach((key) => {
      if (saved[key] !== null) {
        localStorage.setItem(key, saved[key]!);
      }
    });

    setAttendanceData({});
    setMarksData({});
    setGradesData({});
    setScheduleData({});
    setMessage("");
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!username || !password) {
      return alert("Please fill all the fields!");
    }
    handleLogin();
  };

  const [isOffline, setIsOffline] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    setIsOffline(!navigator.onLine);

    const goOffline = () => setIsOffline(true);
    const goOnline = () => setIsOffline(false);

    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);

    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

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

  const handleDemoClick = () => {
    setDemoMode(true);
    setUsername(demoData.username);
    setPassword(demoData.password);
    setCalenderType("ALL");
    setAttendanceData(demoData.attendance);
    setMarksData(demoData.marks);
    setGradesData(demoData.grades);
    setAllGradesData(demoData.allGrades);
    setScheduleData(demoData.schedule);
    sethostelData(demoData.hostel);
    setCalender(demoData.calender);
    setIsLoggedIn(true);
  }

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
      {isAPIworking && !isOffline && (
        <div className="top-0 left-0 w-full bg-yellow-500 text-black text-center py-2 font-medium">
          ⚠️ Unable to connect to API services. Please check back later. ⚠️
        </div>
      )}
      {isReloading && (
        <ReloadModal
          message={message}
          onClose={() => setIsReloading(false)}
          progressBar={progressBar}
        />
      )}

      {(!isLoggedIn && !demoMode) && (
        <div className="flex-grow flex items-center justify-center p-4">
          <LoginForm
            username={username}
            setUsername={setUsername}
            password={password}
            setPassword={setPassword}
            message={message}
            handleFormSubmit={handleFormSubmit}
            progressBar={progressBar}
            handleDemoClick={handleDemoClick}
          />
        </div>
      )}

      {(isLoggedIn || demoMode) && (
        <>
          {isOffline && <div className="top-0 left-0 w-full bg-yellow-500 text-black text-center py-2 font-medium">
            ⚠️ You’re currently offline. Some features may not work.
          </div>}
          {demoMode && <div className="top-0 left-0 w-full bg-blue-500 text-white text-center py-2 font-medium">
            ℹ️ You are in Demo Mode. Data shown is for demonstration purposes only.
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
            setCurrSemesterID={setCurrSemesterID}
            handleLogin={handleLogin}
            moodleData={moodleData}
            setMoodleData={setMoodleData}
            password={password}
            setPassword={setPassword}
          />
        </>
      )}
      {/* <div className="top-0 left-0 w-full bg-blue-500 text-white text-center py-2 font-medium">
        Scheduled maintenance on December 29, 2025 ( afternoon ). API services will be temporarily unavailable.
      </div> */}

      <Footer isLoggedIn={isLoggedIn} />
    </div>
  );
}
