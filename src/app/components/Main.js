"use client";

import { useState, useEffect } from "react";
import { RefreshCcw, X, ChevronDown, ChevronUp } from 'lucide-react'

export default function LoginPage() {
    // --- State Management ---
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [captcha, setCaptcha] = useState("");
    const [captchaImage, setCaptchaImage] = useState("");
    const [cookies, setCookies] = useState([]);
    const [message, setMessage] = useState("");
    const [attendanceData, setAttendanceData] = useState(null);
    const [marksData, setMarksData] = useState(null);
    const [activeDay, setActiveDay] = useState("MON");
    const [csrf, setCsrf] = useState("");
    const [isReloading, setIsReloading] = useState(false); // Controls the reload modal
    const [activeTab, setActiveTab] = useState("attendance")

    const isLoggedIn = attendanceData || marksData;

    // --- Effects ---
    useEffect(() => {
        const storedAttendance = localStorage.getItem("attendance");
        const storedMarks = localStorage.getItem("marks");
        const storedUsername = localStorage.getItem("username");
        const storedPassword = localStorage.getItem("password");

        if (storedAttendance) setAttendanceData(JSON.parse(storedAttendance));
        if (storedMarks) setMarksData(JSON.parse(storedMarks));
        if (storedUsername) setUsername(storedUsername);
        if (storedPassword) setPassword(storedPassword);

        if (!storedAttendance && !storedMarks) {
            loadCaptcha();
        }
    }, []);

    // --- API Functions ---
    const loadCaptcha = async () => {
        setMessage("Loading captcha...");
        try {
            const res = await fetch("/api/getCaptcha");
            const data = await res.json();
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

                const [attRes, marksRes] = await Promise.all([
                    fetch("/api/fetchAttendance", {
                        method: "POST", headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ cookies: data.cookies, dashboardHtml: data.dashboardHtml }),
                    }),
                    fetch("/api/fetchMarks", {
                        method: "POST", headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ cookies: data.cookies, dashboardHtml: data.dashboardHtml }),
                    })
                ]);

                const attData = await attRes.json();
                const marksDataPayload = await marksRes.json();

                // *** CRITICAL CHANGE: Update data and close modal ***
                setAttendanceData(attData);
                setMarksData(marksDataPayload);
                localStorage.setItem("attendance", JSON.stringify(attData));
                localStorage.setItem("marks", JSON.stringify(marksDataPayload));

                setIsReloading(false); // Close the modal on success
                setMessage("Data reloaded successfully!");
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
        <div className="min-h-screen flex flex-col items-center">
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
                    {captchaImage && (
                        <img
                            src={captchaImage}
                            alt="Captcha"
                            className="border rounded-lg w-full h-16 object-contain"
                        />
                    )}
                    <input
                        className="w-full border p-2 rounded-lg"
                        value={captcha}
                        onChange={(e) => setCaptcha(e.target.value)}
                        placeholder="Enter Captcha"
                    />
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        Login
                    </button>
                    <p className="text-sm text-gray-600">{message}</p>
                </form>
            )}

            {isLoggedIn && (
                <div className="w-full">
                    <div className="flex w-full pb-2 mb-4">
                        <button
                            onClick={() => setActiveTab("attendance")}
                            className={`basis-9/20 text-center px-3 py-2 text-sm font-medium hover:cursor-pointer transition-colors ${activeTab === "attendance"
                                ? "bg-blue-600 text-white"
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

                    {/* Tab Content */}
                    <div className="flex justify-center">
                        <div className="max-w-md w-full">
                            {activeTab === "attendance" && <AttendanceTabs data={attendanceData} activeDay={activeDay} setActiveDay={setActiveDay} />}
                            {activeTab === "marks" && <MarksDisplay data={marksData} />}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// --- New Reload Modal Component ---
function ReloadModal({ captchaImage, captcha, setCaptcha, handleLogin, message, onClose }) {
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-gray-600 rounded-xl shadow-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold">Reload Session</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-500 transition hover:cursor-pointer">
                        <X className="w-5 h-5 text-white" />
                    </button>
                </div>
                <p className="text-sm text-white mb-4">
                    Enter the new captcha to refresh your data.
                </p>
                <form onSubmit={handleLogin} className="space-y-4">
                    {captchaImage && (
                        <img
                            src={captchaImage}
                            alt="Captcha"
                            className="w-full h-16 object-contain"
                        />
                    )}
                    <input
                        className="w-full border p-2 rounded-lg"
                        value={captcha}
                        onChange={(e) => setCaptcha(e.target.value)}
                        placeholder="Enter New Captcha"
                    />
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        Submit
                    </button>
                    {message && <p className="text-sm text-gray-600">{message}</p>}
                </form>
            </div>
        </div>
    );
}


function AttendanceTabs({ data, activeDay, setActiveDay }) {
    const days = ["MON", "TUE", "WED", "THU", "FRI"];
    const slotMap = {
        MON: {
            A1: { time: "8:00-8:50" }, F1: { time: "8:55-9:45" }, D1: { time: "9:50-10:40" },
            TB1: { time: "10:45-11:35" }, TG1: { time: "11:40-12:30" }, S11: { time: "12:35-1:25" },
            A2: { time: "2:00-2:50" }, F2: { time: "2:55-3:45" }, D2: { time: "3:50-4:40" },
            TB2: { time: "4:45-5:35" }, TG2: { time: "5:40-6:30" }, S3: { time: "6:35-7:25" },
            L1: { time: "8:00-8:50" }, L2: { time: "8:50-9:40" }, L3: { time: "9:50-10:40" },
            L4: { time: "10:40-11:30" }, L5: { time: "11:40-12:30" }, L6: { time: "12:30-1:20" },
            L31: { time: "2:00-2:50" }, L32: { time: "2:50-3:40" }, L33: { time: "3:50-4:40" },
            L34: { time: "4:40-5:30" }, L35: { time: "5:40-6:30" }, L36: { time: "6:30-7:20" }
        },
        TUE: {
            B1: { time: "8:00-8:50" }, G1: { time: "8:55-9:45" }, E1: { time: "9:50-10:40" },
            TC1: { time: "10:45-11:35" }, TAA1: { time: "11:40-12:30" }, L12: { time: "12:35-1:25" },
            B2: { time: "2:00-2:50" }, G2: { time: "2:55-3:45" }, E2: { time: "3:50-4:40" },
            TC2: { time: "4:45-5:35" }, TAA2: { time: "5:40-6:30" }, S1: { time: "6:35-7:25" },
            L7: { time: "8:00-8:50" }, L8: { time: "8:50-9:40" }, L9: { time: "9:50-10:40" },
            L10: { time: "10:40-11:30" }, L11: { time: "11:40-12:30" }, L37: { time: "2:00-2:50" },
            L38: { time: "2:50-3:40" }, L39: { time: "3:50-4:40" }, L40: { time: "4:40-5:30" },
            L41: { time: "5:40-6:30" }, L42: { time: "6:30-7:20" }
        },
        WED: {
            C1: { time: "8:00-8:50" }, A1: { time: "8:55-9:45" }, F1: { time: "9:50-10:40" },
            TD1: { time: "10:45-11:35" }, TBB1: { time: "11:40-12:30" }, L18: { time: "12:35-1:25" },
            C2: { time: "2:00-2:50" }, A2: { time: "2:55-3:45" }, F2: { time: "3:50-4:40" },
            TD2: { time: "4:45-5:35" }, TBB2: { time: "5:40-6:30" }, S4: { time: "6:35-7:25" },
            L12: { time: "8:00-8:50" }, L13: { time: "8:50-9:40" }, L14: { time: "9:50-10:40" },
            L15: { time: "10:40-11:30" }, L17: { time: "11:40-12:30" }, L43: { time: "2:00-2:50" },
            L44: { time: "2:50-3:40" }, L45: { time: "3:50-4:40" }, L46: { time: "4:40-5:30" },
            L47: { time: "5:40-6:30" }, L48: { time: "6:30-7:20" }
        },
        THU: {
            D1: { time: "8:00-8:50" }, B1: { time: "8:55-9:45" }, G1: { time: "9:50-10:40" },
            TE1: { time: "10:45-11:35" }, TCC1: { time: "11:40-12:30" }, L24: { time: "12:35-1:25" },
            D2: { time: "2:00-2:50" }, B2: { time: "2:55-3:45" }, G2: { time: "3:50-4:40" },
            TE2: { time: "4:45-5:35" }, TCC2: { time: "5:40-6:30" }, S2: { time: "6:35-7:25" },
            L19: { time: "8:00-8:50" }, L20: { time: "8:50-9:40" }, L21: { time: "9:50-10:40" },
            L22: { time: "10:40-11:30" }, L23: { time: "11:40-12:30" }, L49: { time: "2:00-2:50" },
            L50: { time: "2:50-3:40" }, L51: { time: "3:50-4:40" }, L52: { time: "4:40-5:30" },
            L53: { time: "5:40-6:30" }, L54: { time: "6:30-7:20" }
        },
        FRI: {
            E1: { time: "8:00-8:50" }, C1: { time: "8:55-9:45" }, TA1: { time: "9:50-10:40" },
            TF1: { time: "10:45-11:35" }, TDD1: { time: "11:40-12:30" }, S15: { time: "12:35-1:25" },
            E2: { time: "2:00-2:50" }, C2: { time: "2:55-3:45" }, TA2: { time: "3:50-4:40" },
            TF2: { time: "4:45-5:35" }, TDD2: { time: "5:40-6:30" }, L60: { time: "6:35-7:25" },
            L25: { time: "8:00-8:50" }, L26: { time: "8:50-9:40" }, L27: { time: "9:50-10:40" },
            L28: { time: "10:40-11:30" }, L29: { time: "11:40-12:30" }, L30: { time: "12:30-1:20" },
            L55: { time: "2:00-2:50" }, L56: { time: "2:50-3:40" }, L57: { time: "3:50-4:40" },
            L58: { time: "4:40-5:30" }, L59: { time: "5:40-6:30" }
        }
    };

    const dayCardsMap = {};

    days.forEach(day => dayCardsMap[day] = []);

    // 1. Build structured objects instead of raw DOM cards
    data.attendance.forEach(a => {
        const slots = a.slot.split("+");

        slots.forEach(slotName => {
            const cleanSlot = slotName.trim();

            for (const day of days) {
                if (slotMap[day] && slotMap[day][cleanSlot]) {
                    const info = slotMap[day][cleanSlot];
                    const pct = parseInt(a.attendancePercentage);
                    const cls = pct < 50 ? "low" : pct < 75 ? "medium" : "high";

                    dayCardsMap[day].push({
                        ...a,
                        slotName: cleanSlot,
                        time: info.time,
                        cls,
                    });
                }
            }
        });
    });

    // 2. Sort + Merge
    for (const day of days) {
        dayCardsMap[day].sort((a, b) => {
            const slotA = a.slotName;
            const slotB = b.slotName;

            // Morning/Evening sort like your old algorithm
            const isMorningA = /[A-Z]1$|L([1-2]?[0-9]|30)$/.test(slotA);
            const isMorningB = /[A-Z]1$|L([1-2]?[0-9]|30)$/.test(slotB);

            if (isMorningA && !isMorningB) return -1;
            if (!isMorningA && isMorningB) return 1;

            // Sort by slot name within morning/evening
            return slotA.localeCompare(slotB, undefined, { numeric: true });
        });

        // Merge consecutive slots if same class
        const merged = [];
        for (let i = 0; i < dayCardsMap[day].length; i++) {
            const current = dayCardsMap[day][i];
            const next = dayCardsMap[day][i + 1];

            if (
                next &&
                current.courseTitle === next.courseTitle &&
                current.courseType === next.courseType &&
                current.faculty === next.faculty &&
                current.cls === next.cls
            ) {
                const mergedSlotName = `${current.slotName}+${next.slotName}`;
                const mergedSlotTime = `${(current.time.split('-')[0])}-${(next.time.split('-')[1])}`
                merged.push({
                    ...current,
                    slotName: mergedSlotName,
                    time: mergedSlotTime
                });
                i++; // skip next
            } else {
                merged.push(current);
            }
        }
        dayCardsMap[day] = merged;
    }

    return (
        <div className="p-2">
            <h1 className="text-xl font-bold mb-4">Weekly Attendance Slots</h1>
            <div className="flex gap-2 mb-4">
                {days.map((d) => (
                    <button
                        key={d}
                        onClick={() => setActiveDay(d)}
                        className={`px-4 py-2 rounded-lg hover:bg-blue-300 hover:cursor-pointer ${activeDay === d
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-700"
                            }`}
                    >
                        {d}
                    </button>
                ))}
            </div>
            <div className="grid gap-4">
                {dayCardsMap[activeDay].map((a, idx) => (
                    <div key={idx} className={`p-4 rounded-lg shadow border border-color-white ${a.cls}`}>
                        <h3 className="font-semibold">Slot: {a.slotName}</h3>
                        <p><strong>Course:</strong> {a.courseTitle} ({a.courseType})</p>
                        <p><strong>Faculty:</strong> {a.faculty}</p>
                        <p><strong>Time:</strong> {a.time}</p>
                        <p>
                            Attendance: {a.attendedClasses}/{a.totalClasses} ({a.attendancePercentage}%)
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

// MarksDisplay Component
function MarksDisplay({ data }) {
    // State to manage which course's details are visible
    const [openCourse, setOpenCourse] = useState(null);

    const toggleCourse = (slNo) => {
        setOpenCourse(openCourse === slNo ? null : slNo);
    };

    if (!data || !data.marks || data.marks.length === 0) {
        return <p>No marks data available to display.</p>;
    }

    return (
        <div className="p-2">
            <h1 className="text-xl font-bold mb-4">Academic Marks</h1>
            <div className="space-y-4">
                {data.marks.map((course, idx) => (
                    <div key={idx} className="p-4 rounded-lg shadow">
                        <div
                            className="flex justify-between items-center cursor-pointer"
                            onClick={() => toggleCourse(course.slNo)}
                        >
                            <span className="font-medium">
                                {course.courseCode} - {course.courseTitle}
                            </span>
                            {openCourse === course.slNo ? (
                                <ChevronUp className="w-5 h-5" />
                            ) : (
                                <ChevronDown className="w-5 h-5" />
                            )}
                        </div>
                        {openCourse === course.slNo && (
                            <div className="mt-4">
                                <p><strong>Faculty:</strong> {course.faculty}</p>
                                <p><strong>Slot:</strong> {course.slot}</p>
                                <table className="w-full border mt-2">
                                    <thead className="bg-gray-800">
                                        <tr>
                                            <th className="border p-2 text-left">Test</th>
                                            <th className="border p-2">Max</th>
                                            <th className="border p-2">Scored</th>
                                            <th className="border p-2">Weight %</th>
                                            <th className="border p-2">Weighted</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {course.assessments.map((asm, asmIdx) => (
                                            <tr key={asmIdx}>
                                                <td className="border p-2">{asm.title}</td>
                                                <td className="border p-2">{asm.maxMark}</td>
                                                <td className="border p-2">{asm.scoredMark}</td>
                                                <td className="border p-2">{asm.weightagePercent}</td>
                                                <td className="border p-2">{asm.weightageMark}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}