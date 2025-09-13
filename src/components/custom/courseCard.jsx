import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Clock } from "lucide-react"
import { CircularProgressbar, buildStyles } from "react-circular-progressbar"
import "react-circular-progressbar/dist/styles.css"

export default function CourseCard({ a, onClick }) {
    return (
        <Card
            onClick={onClick}
            className="p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer"
        >
            <div className="flex justify-between items-center">
                <div className="flex flex-col gap-2 flex-grow">
                    <CardHeader className="p-0">
                        <CardTitle className="text-lg font-semibold text-gray-800">
                            {a.courseTitle}
                        </CardTitle>
                        <p className="text-sm text-gray-500">{a.slotName}</p>
                    </CardHeader>

                    <CardContent className="p-0 text-sm text-gray-600 space-y-1">
                        <div className="flex items-center gap-2">
                            <Building2 size={16} className="text-gray-500" />
                            <span>{a.slotVenue}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock size={16} className="text-gray-500" />
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
                                        ? "#fff200ff"
                                        : "#00ff11ff",
                            textColor: "#111827",
                            trailColor: "#E5E7EB",
                            strokeLinecap: "round",
                            pathTransitionDuration: 0.5,
                        })}
                    />
                    <p className="text-center text-xs font-semibold mt-2 text-gray-700">
                        Attendance
                    </p>
                </div>
            </div>
        </Card>
    );
}
