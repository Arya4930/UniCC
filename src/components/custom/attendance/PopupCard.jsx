import { useEffect } from "react";
import { Building2, Clock } from "lucide-react"
import { CircularProgressbar, buildStyles } from "react-circular-progressbar"
import "react-circular-progressbar/dist/styles.css"

export function countRemainingClasses(courseCode, dayCardsMap, calendarMonths, fromDate = new Date()) {
    if (!courseCode || !dayCardsMap || !calendarMonths) return 0;

    const daysWithSubject = Object.keys(dayCardsMap).filter(day =>
        dayCardsMap[day].some(c => c.courseCode === courseCode)
    );
    if (daysWithSubject.length === 0) return 0;

    const normalizeDay = (d) => d.slice(0, 3).toUpperCase();
    const subjectDays = daysWithSubject.map(normalizeDay);

    const todayMid = new Date(fromDate);
    todayMid.setHours(0, 0, 0, 0);

    const monthNames = [
        "january", "february", "march", "april", "may", "june",
        "july", "august", "september", "october", "november", "december"
    ];

    const allDays = calendarMonths.flatMap(monthObj => {
        const monthStr = monthObj.month?.toString().toLowerCase() || "";
        const year = monthObj.year || new Date().getFullYear();

        const foundMonth = monthNames.find(m => monthStr.includes(m));
        const mIndex = foundMonth ? monthNames.indexOf(foundMonth) : -1;

        return (monthObj.days || []).map(day => ({
            ...day,
            fullDate: mIndex === -1 ? null : new Date(year, mIndex, day.date)
        }));
    });

    const remainingWorkingDays = allDays.filter((d) => {
        if (!d || !d.type || d.type.toLowerCase() !== "working") return false;
        if (!d.fullDate || isNaN(d.fullDate.getTime())) return false;

        const dDate = new Date(d.fullDate);
        dDate.setHours(0, 0, 0, 0);
        if (dDate < todayMid) return false;

        const dDay = normalizeDay(d.weekday || "");
        return subjectDays.includes(dDay);
    });
    return remainingWorkingDays.length;
}

export default function PopupCard({ a, setExpandedIdx, activeDay, dayCardsMap, analyzeCalendars, importantEvents }) {
    const lab = a.slotName.split('')[0] === "L";

    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "";
        };
    }, []);

    const findEventDate = (eventName) => {
        const ev = [...importantEvents.values()].find(
            (e) => e.event.toLowerCase() === eventName.toLowerCase()
        );
        if (!ev) return null;
        return ev.formattedDate;
    };

    const countTillDate = (endDate) => {
        if (!endDate) return 0;
        const endMid = new Date(endDate);
        endMid.setHours(23, 59, 59, 999);

        const filteredMonths = analyzeCalendars.map((monthObj) => ({
            ...monthObj,
            days: monthObj.days.filter((d) => {
                if (!d.date || !d.weekday) return false;
                const monthStr = monthObj.month?.toLowerCase() || "";
                const mIndex = [
                    "january", "february", "march", "april", "may", "june",
                    "july", "august", "september", "october", "november", "december"
                ].findIndex((m) => monthStr.includes(m));

                const dFull = new Date(monthObj.year, mIndex, d.date);
                dFull.setHours(0, 0, 0, 0);
                return dFull <= endMid;
            }),
        }));

        return countRemainingClasses(a.courseCode, dayCardsMap, filteredMonths, new Date());
    };

    const isLab = a.courseCode.endsWith("(L)");
    const isTheory = a.courseCode.endsWith("(T)");

    const cat1Date = findEventDate("CAT I");
    const cat2Date = findEventDate("CAT II");
    const lidLabDate = findEventDate("LID FOR LAB CLASSES");
    const lidTheoryDate = findEventDate("LID FOR THEORY CLASSES");

    let classesTillCAT1 = 0;
    let classesTillCAT2 = 0;
    let classesTillLID = 0;

    if (Array.isArray(analyzeCalendars) && analyzeCalendars.length > 0) {
        if (isLab) {
            classesTillCAT1 = countTillDate(cat1Date);
            classesTillCAT2 = countTillDate(cat2Date);
            classesTillLID = countTillDate(lidLabDate);
        } else if (isTheory) {
            classesTillCAT1 = countTillDate(cat1Date);
            classesTillCAT2 = countTillDate(cat2Date);
            classesTillLID = countTillDate(lidTheoryDate);
        }
    }
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
            <div className="bg-gray-100 dark:bg-gray-800 midnight:bg-black rounded-2xl shadow-2xl p-5 w-[90%] max-w-md relative max-h-[90vh] overflow-hidden flex flex-col">
                <button
                    className="absolute top-3 right-3 text-gray-700 dark:text-gray-200 midnight:text-gray-200 hover:text-gray-500 dark:hover:text-gray-400"
                    onClick={() => setExpandedIdx(null)}
                >
                    ✕
                </button>

                <div
                    className="rounded-xl shadow-md mb-4 transition-all duration-300"
                >
                    <div className="flex justify-between items-start gap-4">
                        <div className="flex flex-col gap-2 flex-grow">
                            <div className="p-0">
                                <div className="text-base font-semibold text-gray-800 dark:text-gray-100 midnight:text-gray-100">
                                    {a.courseTitle}
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 midnight:text-gray-400">
                                    {a.slotName}
                                </p>
                            </div>

                            <div className="p-0 text-sm text-gray-600 dark:text-gray-300 midnight:text-gray-300 space-y-1">
                                <div className="flex items-center gap-2">
                                    <Building2 size={16} className="text-gray-500 dark:text-gray-400" />
                                    <span>{a.slotVenue}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock size={16} className="text-gray-500 dark:text-gray-400" />
                                    <span>{a.time}</span>
                                </div>
                                <p><strong>Faculty:</strong> {a.faculty}</p>
                                <p><strong>Course Code:</strong> {a.courseCode.slice(0, -3)}</p>
                                <p><strong>Credits:</strong> {a.credits}</p>
                                <p><strong>Lab:</strong> {lab ? "True" : "False"}</p>
                                <p>
                                    <strong>Classes Attended:</strong>{" "}
                                    <span className="font-semibold">
                                        {a.attendedClasses}/{a.totalClasses}
                                    </span>
                                </p>
                            </div>

                            <div className="pt-1">
                                {(() => {
                                    const attended = a.attendedClasses;
                                    const total = a.totalClasses;
                                    const percentage = (attended / total) * 100;

                                    if (percentage < 75) {
                                        const needed = Math.ceil((0.75 * total - attended) / (1 - 0.75));
                                        return (
                                            <p className="text-red-500 dark:text-red-400 midnight:text-red-400 text-sm">
                                                Need to attend <strong>{lab ? needed / 2 : needed}</strong> more{" "}
                                                {lab ? "lab" : "class"} to reach 75%.
                                            </p>
                                        );
                                    } else {
                                        const canMiss = Math.floor(attended / 0.75 - total);
                                        if (canMiss === 0) {
                                            return (
                                                <p className="text-yellow-500 dark:text-yellow-400 midnight:text-yellow-400 text-sm">
                                                    You are on the edge! Attend the next {lab ? "lab" : "class"}.
                                                </p>
                                            );
                                        } else {
                                            return (
                                                <p className="text-green-500 dark:text-green-400 midnight:text-green-400 text-sm">
                                                    Can miss <strong>{lab ? canMiss / 2 : canMiss}</strong>{" "}
                                                    {lab ? "lab" : "class"} and stay above 75%.
                                                </p>
                                            );
                                        }
                                    }
                                })()}
                            </div>

                            {(classesTillCAT1 || classesTillCAT2 || classesTillLID) ? (
                                <div className="mt-2 bg-yellow-100 dark:bg-yellow-900/40 midnight:bg-yellow-900/40 text-sm rounded-xl px-4 py-1">
                                    {classesTillCAT1 !== 0 && <p>Classes left before CAT I: <strong>{classesTillCAT1}</strong></p>}
                                    {classesTillCAT2 !== 0 && <p>Classes left before CAT II: <strong>{classesTillCAT2}</strong></p>}
                                    {classesTillLID !== 0 && <p>Classes left before FAT: <strong>{classesTillLID}</strong></p>}
                                </div>
                            ) : (
                                <p className="text-gray-400 dark:text-gray-500 midnight:text-gray-500 text-sm italic">
                                    Calendar data unavailable
                                </p>
                            )}
                        </div>

                        <div className="w-24 h-24 flex-shrink-0 flex flex-col items-center justify-center">
                            <CircularProgressbar
                                value={a.attendancePercentage}
                                text={`${a.attendancePercentage}%`}
                                styles={buildStyles({
                                    pathColor:
                                        a.attendancePercentage < 75
                                            ? "#EF4444"
                                            : a.attendancePercentage < 85
                                                ? "#FACC15"
                                                : "#2df04aff",
                                    textColor: "currentColor",
                                    trailColor: "#CBD5E1",
                                    strokeLinecap: "round",
                                    pathTransitionDuration: 0.5,
                                })}
                            />
                            <p className="text-center text-xs font-semibold mt-1 text-gray-700 dark:text-gray-300 midnight:text-gray-300">
                                Attendance
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-1">
                    <ul className="list-disc list-inside text-xs space-y-1">
                        {a.viewLink?.map((d, i) => (
                            <li
                                key={i}
                                className={
                                    d.status.toLowerCase() === "absent"
                                        ? "text-red-500"
                                        : d.status.toLowerCase() === "present"
                                            ? "text-green-500"
                                            : d.status.toLowerCase() === "on duty"
                                                ? "text-yellow-500"
                                                : "text-gray-700 dark:text-gray-300 midnight:text-gray-300"
                                }
                            >
                                {d.date} – {d.status}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}