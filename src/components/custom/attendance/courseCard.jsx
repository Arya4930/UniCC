import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Clock } from "lucide-react"
import { CircularProgressbar, buildStyles } from "react-circular-progressbar"
import "react-circular-progressbar/dist/styles.css"

function countRemainingClasses(courseCode, dayCardsMap, calendarMonths, fromDate = new Date()) {
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

export default function CourseCard({ a, onClick, activeDay, dayCardsMap, analyzeCalendars }) {
    const lab = a.slotName.split('')[0] === "L";

    const isOngoing = () => {
        if (!a.time || !activeDay) return false;

        const today = new Date().toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
        if (!today.startsWith(activeDay.slice(0, 3).toUpperCase())) return false;

        const [startStr, endStr] = a.time.split("-").map(t => t.trim());
        if (!startStr || !endStr) return false;

        const parseTime = (str) => {
            const [hour, minute] = str.split(":").map(Number);
            const d = new Date();
            let h = hour;
            let m = minute || 0;
            if (h < 8) h += 12;
            d.setHours(h, m, 0, 0);
            return d;
        };

        const start = parseTime(startStr);
        const end = parseTime(endStr);
        const now = new Date();

        return now >= start && now <= end;
    };

    const ongoing = isOngoing();

    const left = Array.isArray(analyzeCalendars) && analyzeCalendars.length > 0
        ? countRemainingClasses(a.courseCode, dayCardsMap, analyzeCalendars)
        : null;

    return (
        <Card
            onClick={onClick}
            className={`p-4 rounded-lg shadow-sm transition-shadow duration-300 cursor-pointer ${ongoing
                ? "ring-2 ring-yellow-200 shadow-lg bg-yellow-50 dark:bg-yellow-900/40 midnight:bg-yellow-900/40"
                : "hover:shadow-md dark:hover:shadow-lg midnight:hover:shadow-lg"
                }`}
        >
            <div className="flex justify-between items-center">
                <div className="flex flex-col gap-2 flex-grow">
                    <CardHeader className="p-0">
                        <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-100 midnight:text-gray-100">
                            {a.courseTitle}
                        </CardTitle>
                        <p className="text-sm text-gray-500 dark:text-gray-400 midnight:text-gray-400">
                            {a.slotName}
                        </p>
                    </CardHeader>

                    <CardContent className="p-0 text-sm text-gray-600 dark:text-gray-300 midnight:text-gray-300 space-y-1">
                        <div className="flex items-center gap-2">
                            <Building2 size={16} className="text-gray-500 dark:text-gray-400 midnight:text-gray-400" />
                            <span>{a.slotVenue}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock size={16} className="text-gray-500 dark:text-gray-400 midnight:text-gray-400" />
                            <span>{a.time}</span>
                        </div>
                        <p>
                            <strong>Faculty:</strong> {a.faculty}
                        </p>
                        <p>
                            <strong>Credits:</strong> {a.credits}
                        </p>
                        <p>
                            <strong>Classes Attended:</strong>{" "}
                            <span className="font-semibold">
                                {a.attendedClasses}/{a.totalClasses}
                            </span>
                        </p>
                    </CardContent>
                    {(() => {
                        const attended = a.attendedClasses;
                        const total = a.totalClasses;
                        const percentage = (attended / total) * 100;

                        if (percentage < 75) {
                            const needed = Math.ceil((0.75 * total - attended) / (1 - 0.75));
                            return (
                                <p className="text-red-500 dark:text-red-400 midnight:text-red-400 text-sm">
                                    Need to attend <strong>{lab ? needed / 2 : needed}</strong> more {lab ? "lab" : "class"}
                                    {needed > 1 && (lab ? "s" : "es")} to reach 75%.
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
                                        Can miss <strong>{lab ? canMiss / 2 : canMiss}</strong> {lab ? "lab" : "class"}
                                        {canMiss !== 1 && (lab ? "s" : "es")} and stay above 75%.
                                    </p>
                                );
                            }
                        }
                    })()}
                    {left !== null ? (
                        <>
                            <div className="text-green-500 dark:text-green-400 midnight:text-green-400 text-sm">
                                {left} classes left in this semester
                            </div>
                            <div className="text-gray-700 dark:text-gray-500 midnight:text-gray-300 text-xs">
                                Not Counting Saturdays, Beta feature, can have bugs
                            </div>
                        </>
                    ) : (
                        <div className="text-gray-400 dark:text-gray-500 midnight:text-gray-500 text-sm italic">
                            Calendar data unavailable
                        </div>
                    )}
                </div>

                <div className="w-28 h-28 flex-shrink-0 flex flex-col items-center justify-center ml-4">
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
                    <p className="text-center text-xs font-semibold mt-2 text-gray-700 dark:text-gray-300 midnight:text-gray-300">
                        Attendance
                    </p>
                </div>
            </div>
        </Card>
    );
}
