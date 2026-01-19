'use client';
import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { ReloadModal } from "./reloadModel";
import LoginForm from "./loginForm";
import DashboardContent from "./Dashboard";
import Footer from "./footer/Footer";
import config from '../../app/config.json'
import { attendanceRes, ODListItem, ODListRaw } from "@/types/data/attendance";
import { AllGradesRes } from "@/types/data/allgrades";
import { loadActivityTree, saveActivityTree } from "@/lib/activit-tree";
import demoData from '../../app/demoData.json';
import Skeleton from "@/components/ui/skeleton";
import { useToast } from "@/components/custom/toast/ToastProvider";

export const API_BASE =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://api.uni-cc.site";

const STORAGE_KEYS = {
  attendance: "attendance",
  marks: "marks",
  grades: "grades",
  allGrades: "allGrades",
  schedule: "schedule",
  hostel: "hostel",
  calender: "calender",
  calendarType: "calendarType",
  currSemesterID: "currSemesterID",
  username: "username",
  password: "password",
  moodleData: "moodleData",
  theme: "theme",
  CGPAHidden: "CGPAHidden",
  activityTree: "activityTree",
} as const;

function readJSON<T>(key: string): T | null {
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJSON<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export default function LoginPage() {
  // --- State Management ---
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [attendanceData, setAttendanceData] = useState<attendanceRes>({});
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
  const [moodleData, setMoodleData] = useState<unknown[]>([]);
  const [isAPIDown, setIsAPIDown] = useState<boolean>(false);
  const [demoMode, setDemoMode] = useState<boolean>(false);
  const { notify } = useToast();

  useEffect(() => {
    const day = new Date().toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
    setActiveDay(day);

    const checkAPIStatus = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/status`);
        const data = await res.json();
        setIsAPIDown(data.text === "API is working" ? false : true);
      } catch (err) {
        setIsAPIDown(true);
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
    attendance.attendance?.forEach(course => {
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
    const parsedStoredAttendance = readJSON<attendanceRes>(STORAGE_KEYS.attendance);
    if (parsedStoredAttendance && parsedStoredAttendance.attendance) {
      setAttendanceAndOD(parsedStoredAttendance);
    }
    const storedMarks = readJSON<object>(STORAGE_KEYS.marks);
    const storedGrades = readJSON<object>(STORAGE_KEYS.grades);
    const storedAllGrades = readJSON<AllGradesRes>(STORAGE_KEYS.allGrades);
    const storedSchedule = readJSON<object>(STORAGE_KEYS.schedule);
    const storedHostel = readJSON<object>(STORAGE_KEYS.hostel);
    const storedCalendar = readJSON<object>(STORAGE_KEYS.calender);
    const storedMoodle = readJSON<unknown[]>(STORAGE_KEYS.moodleData);
    const storedUsername = localStorage.getItem(STORAGE_KEYS.username);
    const storedPassword = localStorage.getItem(STORAGE_KEYS.password);
    const storedCalendarType = localStorage.getItem(STORAGE_KEYS.calendarType);
    const storedCurrSemesterID = localStorage.getItem(STORAGE_KEYS.currSemesterID);

    if (storedMarks) setMarksData(storedMarks);
    if (storedGrades) setGradesData(storedGrades);
    if (storedAllGrades) setAllGradesData(storedAllGrades);
    if (storedSchedule) setScheduleData(storedSchedule);
    if (storedHostel) sethostelData(storedHostel);
    if (storedCalendar) setCalender(storedCalendar);
    if (storedMoodle) setMoodleData(storedMoodle);
    if (storedUsername) setUsername(storedUsername);
    if (storedPassword) setPassword(storedPassword);
    if (storedCalendarType) setCalenderType(storedCalendarType);
    if (storedCurrSemesterID) setCurrSemesterID(storedCurrSemesterID);

    setIsLoggedIn(Boolean(storedUsername && storedPassword));
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
      localStorage.setItem(STORAGE_KEYS.username, username);
      localStorage.setItem(STORAGE_KEYS.password, password);

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

      writeJSON(STORAGE_KEYS.attendance, attRes);
      writeJSON(STORAGE_KEYS.marks, marksRes);
      writeJSON(STORAGE_KEYS.grades, gradesRes);
      writeJSON(STORAGE_KEYS.allGrades, allGradesRes);
      writeJSON(STORAGE_KEYS.schedule, ScheduleRes);
      writeJSON(STORAGE_KEYS.hostel, HostelRes);
      writeJSON(STORAGE_KEYS.calender, calenderRes);

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
      localStorage.setItem(STORAGE_KEYS.username, username);
      localStorage.setItem(STORAGE_KEYS.password, password);

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

      writeJSON(STORAGE_KEYS.attendance, attRes);
      writeJSON(STORAGE_KEYS.marks, marksRes);

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

    const keysToKeep = [STORAGE_KEYS.theme, STORAGE_KEYS.CGPAHidden, STORAGE_KEYS.activityTree];

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

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
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

    const handleOnline = () => {
      setIsOffline(false);
      notify({
        variant: "success",
        title: "Back online",
        description: "Syncing latest data...",
      });
      if (isLoggedIn && !demoMode) {
        handleReloadRequest();
      }
    };

    const handleOffline = () => {
      setIsOffline(true);
      notify({
        variant: "error",
        title: "Offline",
        description: "Some features may feel limited until you reconnect.",
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [demoMode, handleReloadRequest, isLoggedIn, notify]);

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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 midnight:bg-black p-6">
        <div className="mx-auto w-full max-w-6xl space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 midnight:bg-black flex flex-col text-gray-900 dark:text-gray-100 midnight:text-gray-100 transition-colors">
      {isAPIDown && !isOffline && (
        <div className="top-0 left-0 w-full bg-yellow-500 text-black text-center py-2 font-medium">
          Unable to connect to API services. Please check back later.
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
            You’re currently offline. Some features may not work.
          </div>}
          {demoMode && <div className="top-0 left-0 w-full bg-blue-500 text-white text-center py-2 font-medium">
            You are in Demo Mode. Data shown is for demonstration purposes only.
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
