"use client";

import { useState, useEffect } from "react";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [captcha, setCaptcha] = useState("");
    const [captchaImage, setCaptchaImage] = useState("");
    const [cookies, setCookies] = useState([]);
    const [message, setMessage] = useState("");
    const [attendanceData, setAttendanceData] = useState(null);
    const [activeDay, setActiveDay] = useState("MON");
    const [csrf, setCsrf] = useState("")

    // Load captcha on mount
    useEffect(() => {
        loadCaptcha();
    }, []);

    const loadCaptcha = async () => {
        try {
            const res = await fetch("/api/getCaptcha");
            const data = await res.json();
            setCookies(Array.isArray(data.cookies) ? data.cookies : [data.cookies]);
            setCaptchaImage(data.captchaBase64);
            setCsrf(data.csrf)
        } catch (err) {
            console.error("Failed to load captcha", err);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!cookies.length) return alert("Cookies missing!");

        try {
            const res = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password, captcha, cookies, csrf }),
            });
            const data = await res.json();
            setMessage(data.message || JSON.stringify(data));

            if (data.success && data.dashboardHtml) {
                const attRes = await fetch("/api/fetchAttendance", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ cookies: data.cookies, dashboardHtml: data.dashboardHtml }),
                });
                const attData = await attRes.json();
                console.log(attData)
                setAttendanceData(attData);
                localStorage.setItem("attendance", JSON.stringify(attData));
            }
        } catch (err) {
            console.error("Login failed", err);
            setMessage("Login failed, check console.");
        }
    };

    return (
        <div style={{ padding: 20, fontFamily: "Arial" }}>
            {!attendanceData && (
                <form onSubmit={handleLogin} style={{ maxWidth: 400, margin: "auto" }}>
                    <h2>Login</h2>
                    <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" style={{ width: "100%", marginBottom: 10, padding: 8 }} />
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" style={{ width: "100%", marginBottom: 10, padding: 8 }} />
                    {captchaImage && <img src={captchaImage} alt="Captcha" style={{ marginBottom: 10 }} />}
                    {captchaImage && <input value={captcha} onChange={e => setCaptcha(e.target.value)} placeholder="Enter Captcha" style={{ width: "100%", marginBottom: 10, padding: 8 }} />}
                    {captchaImage && <button type="submit" style={{ width: "100%", padding: 10, background: "#3498db", color: "#fff", border: "none", borderRadius: 5 }}>Login</button>}
                    <p>{message}</p>
                </form>
            )}

            {attendanceData && <AttendanceTabs data={attendanceData} activeDay={activeDay} setActiveDay={setActiveDay} />}
        </div>
    );
}

// AttendanceTabs Component
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

    data.attendance.forEach(a => {
        const slots = a.slot.split("+");
        slots.forEach(slotName => {
            const cleanSlot = slotName.trim();
            for (const day of days) {
                if (slotMap[day] && slotMap[day][cleanSlot]) {
                    const info = slotMap[day][cleanSlot];
                    const pct = parseInt(a.attendancePercentage);
                    const cls = pct < 50 ? "low" : pct < 75 ? "medium" : "high";

                    dayCardsMap[day].push({ ...a, slotName: cleanSlot, time: info.time, cls });
                }
            }
        });
    });

    return (
        <div>
            <h1 style={{ textAlign: "center" }}>Weekly Attendance Slots</h1>
            <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 20 }}>
                {days.map(d => (
                    <button
                        key={d}
                        style={{
                            padding: "10px 20px",
                            borderRadius: 8,
                            cursor: "pointer",
                            fontWeight: "bold",
                            background: activeDay === d ? "#3498db" : "#ddd",
                            color: activeDay === d ? "white" : "black"
                        }}
                        onClick={() => setActiveDay(d)}
                    >
                        {d}
                    </button>
                ))}
            </div>

            <div>
                {days.map(d => (
                    <div key={d} style={{ display: activeDay === d ? "flex" : "none", flexDirection: "column", gap: 20 }}>
                        {dayCardsMap[d].map((a, idx) => (
                            <div key={idx} style={{
                                background: "white",
                                padding: 15,
                                borderRadius: 12,
                                boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
                            }}>
                                <h3>Slot: {a.slotName}</h3>
                                <div><strong>Course:</strong> {a.courseTitle} ({a.courseType})</div>
                                <div><strong>Faculty:</strong> {a.faculty}</div>
                                <div><strong>Time:</strong> {a.time}</div>
                                <div style={{ fontWeight: "bold", color: a.cls === "low" ? "red" : a.cls === "medium" ? "orange" : "green" }}>
                                    Attendance: {a.attendedClasses}/{a.totalClasses} ({a.attendancePercentage}%)
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
