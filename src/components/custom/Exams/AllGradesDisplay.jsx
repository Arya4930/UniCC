"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import NoContentFound from "../NoContentFound";

export default function AllGradesDisplay({ data }) {
    if (!data || !data.grades) {
        return <NoContentFound />;
    }

    const semesterKeys = Object.keys(data.grades).filter((sem) => data.grades[sem]);
    if (semesterKeys.length === 0) {
        return <NoContentFound />;
    }

    const [activeSem, setActiveSem] = useState(semesterKeys[semesterKeys.length - 1]);
    const [openCourse, setOpenCourse] = useState(null);

    const semesterData = data.grades[activeSem];
    const gpa = semesterData?.gpa || null;
    const gradeList = semesterData?.grades || [];

    const formatNumber = (num) => {
        const numericValue = Number(num);
        if (num == null || isNaN(numericValue)) return "-";
        return Number(numericValue.toFixed(2)).toString();
    };

    return (
        <div className="py-2">
            <h1 className="text-xl font-bold mb-4 text-center text-gray-900 dark:text-gray-100 midnight:text-gray-100">
                Academic Grades
            </h1>

            <div
                data-scrollable
                className="flex w-full overflow-x-auto mb-4"
            >
                {semesterKeys.map((sem) => (
                    <button
                        key={sem}
                        onClick={() => {
                            setActiveSem(sem);
                            setOpenCourse(null);
                        }}
                        className={`flex-1 min-w-[120px] text-center py-2 text-sm font-medium transition-colors ${activeSem === sem
                            ? "bg-blue-600 text-white midnight:bg-blue-700"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600 midnight:bg-black midnight:text-gray-300 midnight:hover:bg-gray-900"
                            }`}
                    >
                        {sem}
                    </button>
                ))}
            </div>

            {gpa && (
                <div className="mt-4 text-center">
                    <span className="text-lg font-semibold text-green-700 dark:text-green-400">
                        GPA: {gpa}
                    </span>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 px-2">
                {gradeList.map((course, idx) => (
                    <div
                        key={course.courseId || course.courseCode || idx}
                        className="p-4 rounded-lg shadow bg-white dark:bg-slate-800 midnight:bg-black midnight:outline midnight:outline-1 midnight:outline-gray-800 cursor-pointer"
                        onClick={() => setOpenCourse(course.courseId)}
                    >
                        <div className="flex justify-between items-start gap-3">
                            <div className="flex-1 min-w-0">
                                <span className="font-medium text-gray-800 dark:text-gray-200 midnight:text-gray-200 text-sm sm:text-base break-words block">
                                    {course.courseCode} - {course.courseTitle}
                                </span>

                                <div className="px-3 py-1 inline-flex items-center justify-center bg-gray-200 dark:bg-slate-700 midnight:bg-gray-900 text-black dark:text-gray-300 midnight:text-gray-300 text-xs rounded-full outline outline-1 outline-gray-700 dark:outline-gray-500 midnight:outline-gray-700 mt-2">
                                    {course.courseType}
                                </div>
                            </div>

                            <div className="flex flex-col items-end flex-shrink-0 gap-2 text-sm text-right">
                                <div className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 font-medium whitespace-nowrap">
                                    Grade: {course.grade}
                                </div>
                                <div className="px-3 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 font-medium whitespace-nowrap">
                                    Total: {course.grandTotal}
                                </div>
                            </div>
                        </div>

                        {openCourse === course.courseId && (
                            <div
                                data-scrollable
                                className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50"
                            >
                                <div
                                    className="bg-white dark:bg-slate-800 midnight:bg-black rounded-xl shadow-lg p-6 max-w-3xl w-[95%] relative max-h-[90vh] overflow-y-auto"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100 midnight:text-gray-100">
                                        {course.courseCode} – {course.courseTitle}
                                    </h2>
                                    <p className="mb-1">
                                        <strong>Course Type:</strong> {course.courseType}
                                    </p>
                                    <p className="mb-3">
                                        <strong>Grade:</strong> {course.grade}
                                    </p>

                                    {course.range && (
                                        <div className="overflow-x-auto mt-2">
                                            <table className="w-full border border-gray-300 dark:border-gray-600 midnight:border-gray-700">
                                                <thead className="bg-gray-800 text-white dark:bg-slate-700 midnight:bg-gray-900">
                                                    <tr>
                                                        {Object.keys(course.range).map((grade) => (
                                                            <th key={grade} className="border p-2 text-center">
                                                                {grade}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        {Object.values(course.range).map((range, idx) => (
                                                            <td
                                                                key={idx}
                                                                className="border p-2 text-center text-gray-800 dark:text-gray-200 midnight:text-gray-200"
                                                            >
                                                                {range}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    )}

                                    {course.details && course.details.length > 0 ? (
                                        <div className="overflow-x-auto mt-6">
                                            <table className="w-full border border-gray-300 dark:border-gray-600 midnight:border-gray-700">
                                                <thead className="bg-gray-800 text-white dark:bg-slate-700 midnight:bg-gray-900">
                                                    <tr>
                                                        <th className="border p-2 text-left">Component Name</th>
                                                        <th className="border p-2 text-center">Max</th>
                                                        <th className="border p-2 text-center">Scored</th>
                                                        <th className="border p-2 text-center">Weightage</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {course.details.map((d, idx) => (
                                                        <tr
                                                            key={idx}
                                                            className="border-gray-300 dark:border-gray-600 midnight:border-gray-700"
                                                        >
                                                            <td className="border p-2">{d.component}</td>
                                                            <td className="border p-2 text-center">{formatNumber(d.maxMark)}</td>
                                                            <td className="border p-2 text-center">{formatNumber(d.scoredMark)}</td>
                                                            <td className="border p-2 text-center">{formatNumber(d.weightageMark)}</td>
                                                        </tr>
                                                    ))}

                                                    <tr className="font-bold border-t border-gray-400 dark:border-gray-500 midnight:border-gray-600">
                                                        <td className="border p-2">
                                                            Total
                                                        </td>
                                                        <td className="border p-2 text-center">
                                                            {formatNumber(
                                                                course.details.reduce((sum, d) => sum + (Number(d.maxMark) || 0), 0)
                                                            )}
                                                        </td>
                                                        <td className="border p-2 text-center">
                                                            {formatNumber(
                                                                course.details.reduce((sum, d) => sum + (Number(d.scoredMark) || 0), 0)
                                                            )}
                                                        </td>
                                                        <td className="border p-2 text-center">
                                                            {formatNumber(
                                                                course.details.reduce((sum, d) => sum + (Number(d.weightageMark) || 0), 0)
                                                            )}
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                            No breakdown data available.
                                        </p>
                                    )}


                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setOpenCourse(null)}
                                        className="top-2 right-2 absolute cursor-pointer hover:bg-gray-200 dark:hover:bg-slate-700 midnight:hover:bg-gray-900"
                                    >
                                        <X
                                            size={22}
                                            className="text-gray-600 dark:text-gray-300 midnight:text-gray-200"
                                        />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
