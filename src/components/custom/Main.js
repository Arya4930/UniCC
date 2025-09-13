"use client";

import { useState, useEffect } from "react";
import { RefreshCcw } from 'lucide-react'
import Image from "next/image";

import { ReloadModal } from "./reloadModel";
import GradesDisplay from "./gradesDisplay";
import MarksDisplay from "./marksDislay";
import AttendanceTabs from "./attendanceTabs";

export default function LoginPage() {
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
    const [activeDay, setActiveDay] = useState("MON");
    const [csrf, setCsrf] = useState("");
    const [isReloading, setIsReloading] = useState(false); // Controls the reload modal
    const [activeTab, setActiveTab] = useState("attendance");
    const [attendancePercentage, setattendancePercentage] = useState(0);
    const [ODhoursData, setODhoursData] = useState([]);
    const [ODhoursIsOpen, setODhoursIsOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [GradesDisplayIsOpen, setGradesDisplayIsOpen] = useState(false)

    // --- Effects ---
    useEffect(() => {
        let storedAttendance = localStorage.getItem("attendance");
        const storedMarks = localStorage.getItem("marks");
        const storedGrades = localStorage.getItem("grades");
        const storedUsername = localStorage.getItem("username");
        const storedPassword = localStorage.getItem("password");
        storedAttendance = JSON.parse(storedAttendance);

        if (storedAttendance && storedAttendance.attendance) {
            setAttendanceData(storedAttendance)
            let totalClass = 0;
            let attendedClasses = 0;
            storedAttendance.attendance.forEach(course => {
                totalClass += parseInt(course.totalClasses);
                attendedClasses += parseInt(course.attendedClasses);
            })
            setattendancePercentage(Math.round(attendedClasses * 10000 / totalClass) / 100)

            let ODArr = [];
            storedAttendance.attendance.forEach(course => {
                if (!course.viewLinkData || !Array.isArray(course.viewLinkData)) return;
                course.viewLinkData.forEach(day => {
                    if (day.status == "On Duty") {
                        ODArr.push({ date: day.date, courseTitle: course.courseTitle });
                    }
                });
            })
            setODhoursData(ODArr);
        };
        if (storedMarks) setMarksData(JSON.parse(storedMarks));
        if (storedUsername) setUsername(storedUsername);
        if (storedPassword) setPassword(storedPassword);
        if (storedGrades) setGradesData(JSON.parse(storedGrades));
        setIsLoggedIn((storedUsername && storedPassword) ? true : false)

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

                const [attRes, marksRes, gradesRes] = await Promise.all([
                    fetch("/api/fetchAttendance", {
                        method: "POST", headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ cookies: data.cookies, dashboardHtml: data.dashboardHtml }),
                    }),
                    fetch("/api/fetchMarks", {
                        method: "POST", headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ cookies: data.cookies, dashboardHtml: data.dashboardHtml }),
                    }),
                    fetch("/api/fetchGrades", {
                        method: "POST", headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ cookies: data.cookies, dashboardHtml: data.dashboardHtml }),
                    })
                ]);

                const attData = await attRes.json();
                const marksDataPayload = await marksRes.json();
                const gradesDataPayload = await gradesRes.json();

                // *** CRITICAL CHANGE: Update data and close modal ***
                setAttendanceData(attData);
                setMarksData(marksDataPayload);
                setGradesData(gradesDataPayload);
                localStorage.setItem("attendance", JSON.stringify(attData));
                localStorage.setItem("marks", JSON.stringify(marksDataPayload));
                localStorage.setItem("grades", JSON.stringify(gradesDataPayload));

                setIsReloading(false); // Close the modal on success
                setMessage("Data reloaded successfully!");
                setIsLoggedIn(true)
            } else {
                setMessage(data.message || "Login failed. Please try again.");
                setCaptcha("");
                loadCaptcha(); // Load a new captcha within the modal
            }
        } catch (err) {
            setMessage("Login failed, check console.");
        }
    };

    // --- Event Handlers ---
    const handleReloadRequest = () => {
        setCaptcha(""); // Clear previous captcha
        setIsReloading(true); // Open the modal
        loadCaptcha();
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
                <form
                    onSubmit={handleLogin}
                    className="bg-gray-600 shadow-md rounded-xl p-6 w-full max-w-md space-y-4"
                >
                    <h2 className="text-xl font-bold text-white">Login</h2>
                    <input
                        className="w-full border p-2 rounded-lg"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Username"
                    />
                    <input
                        className="w-full border p-2 rounded-lg"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                    />
                    {captchaImage && message !== "Logging in and fetching data..." && (
                        <>
                            <Image
                                src={captchaImage}
                                alt="Captcha"
                                className="border rounded-lg w-full h-16 object-contain"
                                width={200}
                                height={64}
                                unoptimized
                            />
                            <input
                                className="w-full border p-2 rounded-lg"
                                value={captcha}
                                onChange={(e) => setCaptcha(e.target.value)}
                                placeholder="Enter Captcha"
                            />
                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition hover:cursor-pointer"
                            >
                                Login
                            </button>
                        </>
                    )}
                    <p className="text-sm">{message}</p>
                </form>
            )}

            {isLoggedIn && (
                <div className="w-full">
                    <div className="flex w-full pb-2 mb-4">
                        <button
                            onClick={() => setActiveTab("attendance")}
                            className={`basis-9/20 text-sm font-medium transition-colors rounded-none hover:cursor-pointer ${activeTab === "attendance"
                                ? "bg-blue-600 text-white hover:bg-blue-700"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                }`}
                        >
                            Attendance
                        </button>

                        {/* Marks Tab */}
                        <button
                            onClick={() => setActiveTab("marks")}
                            className={`basis-9/20 text-center px-3 py-2 text-sm font-medium hover:cursor-pointer transition-colors ${activeTab === "marks"
                                ? "bg-blue-600 text-white"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                }`}
                        >
                            Marks
                        </button>

                        {/* Reload Button */}
                        <button
                            onClick={handleReloadRequest}
                            className="basis-2/20 flex items-center justify-center bg-blue-500 hover:cursor-pointer text-white px-3 py-2 text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                            <RefreshCcw className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex justify-center bg-white">
                        <div className="max-w-md w-full">
                            {GradesData && (
                                <div className="overflow-x-auto">
                                    <div className="inline-flex gap-4 py-4">
                                        <div
                                            className="cursor-pointer p-6 bg-white rounded-2xl shadow hover:shadow-lg transition min-w-[180px]"
                                            onClick={() => console.log("Attendance clicked")}
                                        >
                                            <h2 className="text-lg font-semibold text-gray-600">Attendance</h2>
                                            <p className="text-3xl font-bold text-gray-900 mt-2">
                                                {attendancePercentage}
                                            </p>
                                        </div>

                                        <div
                                            className="cursor-pointer p-6 bg-white rounded-2xl shadow hover:shadow-lg transition min-w-[180px]"
                                            onClick={() => console.log("CGPA clicked")}
                                        >
                                            <h2 className="text-lg font-semibold text-gray-600">CGPA</h2>
                                            <p className="text-3xl font-bold text-gray-900 mt-2">
                                                {GradesData?.cgpa?.cgpa}
                                            </p>
                                        </div>

                                        <div
                                            className="cursor-pointer p-6 bg-white rounded-2xl shadow hover:shadow-lg transition min-w-[180px]"
                                            onClick={() => setGradesDisplayIsOpen(true)}
                                        >
                                            <h2 className="text-lg font-semibold text-gray-600">Credits Earned</h2>
                                            <p className="text-3xl font-bold text-gray-900 mt-2">
                                                {GradesData?.cgpa?.creditsEarned}
                                            </p>
                                        </div>
                                        {/* Modal */}
                                        {GradesDisplayIsOpen && (
                                            <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
                                                <div className="rounded-2xl shadow-lg w-11/12 max-w-md max-h-[90vh] overflow-y-auto relative">
                                                    <GradesDisplay data={GradesData} />
                                                    <button
                                                        className="absolute top-2 right-2 text-gray-500 hover:text-gray-900 font-bold hover:cursor-pointer"
                                                        onClick={() => setGradesDisplayIsOpen(false)}
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        <div
                                            className="cursor-pointer p-6 bg-white rounded-2xl shadow hover:shadow-lg transition min-w-[180px]"
                                            onClick={() => setODhoursIsOpen(true)}
                                        >
                                            <h2 className="text-lg font-semibold text-gray-600">OD hours</h2>
                                            <p className="text-3xl font-bold text-gray-900 mt-2">{ODhoursData.length}/40</p>
                                        </div>

                                        {/* Modal */}
                                        {ODhoursIsOpen && (
                                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                                <div className="bg-gray-600 rounded-2xl shadow-lg p-6 w-80 relative">
                                                    <h3 className="text-xl font-bold mb-4">OD Hours Info</h3>
                                                    {ODhoursData.map((day, idx) => (
                                                        <div key={idx}>
                                                            {day?.date} - {day?.courseTitle}
                                                        </div>
                                                    ))}
                                                    <button
                                                        className="absolute top-2 right-2 text-gray-500 hover:text-gray-900 font-bold"
                                                        onClick={() => setODhoursIsOpen(false)}
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                            {activeTab === "attendance" && attendanceData && attendanceData.attendance && <AttendanceTabs data={attendanceData} activeDay={activeDay} setActiveDay={setActiveDay} />}
                            {activeTab === "marks" && marksData && <MarksDisplay data={marksData} />}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
