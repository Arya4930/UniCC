import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const normalizeCourseCode = (courseCode) => courseCode?.slice(0, 8) ?? "";
const gradePointMap = {
    S: 10,
    A: 9,
    B: 8,
    C: 7,
    D: 6,
    E: 5,
    F: 0,
    N: 0
};

export default function CGPAPredictor({ data, attendance, CGPA }) {
    const [predictedGrades, setPredictedGrades] = useState({});
    const [extraSemesters, setExtraSemesters] = useState<Array<{ id: number; credits: string; gpa: string }>>([]);

    const curr = attendance.filter((a) => (a.category !== "Non-graded Core Requirement" && a.courseTitle !== "")).map(a => ({
        courseCode: normalizeCourseCode(a.courseCode),
        courseTitle: a.courseTitle,
        credits: parseFloat(a.credits)
    }));

    const allSemesterGrades = Object.values(data.grades) as Array<{ grades?: Array<{ courseCode?: string; grade?: string }> }>;

    const gradePool = allSemesterGrades.flatMap((semester) => semester?.grades || []).reduce((pool, course) => {
        const normalizedCode = normalizeCourseCode(course?.courseCode);
        if (normalizedCode) {
            pool[normalizedCode] = course?.grade;
        }
        return pool;
    }, {});

    const getGradePoint = (grade) => gradePointMap[grade] ?? 9;
    const getNumberInputValue = (value) => {
        const parsedValue = Number(value);
        return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : 0;
    };

    const currentCgpa = Number(CGPA?.cgpa) || 0;
    const currentCredits = Number(CGPA?.creditsEarned) || 0;
    const SemestersCompleted = Object.values(data?.grades || {}).filter(Boolean).length;

    const predictedSemesterCreditPoints = curr.reduce((sum, course, idx) => {
        const key = `${course.courseCode}-${idx}`;
        const matchedGrade = gradePool[normalizeCourseCode(course.courseCode)];
        const selectedGrade = predictedGrades[key] || matchedGrade || "A";
        const gradePoint = getGradePoint(selectedGrade);
        return sum + (course.credits || 0) * gradePoint;
    }, 0);

    const predictedCreditPoints = curr.reduce((sum, course, idx) => {
        const key = `${course.courseCode}-${idx}`;
        const matchedGrade = gradePool[normalizeCourseCode(course.courseCode)];
        const selectedGrade = predictedGrades[key] || matchedGrade || "A";
        const selectedGradePoint = getGradePoint(selectedGrade);

        if (matchedGrade) {
            const matchedGradePoint = getGradePoint(matchedGrade);
            return sum + (course.credits || 0) * (selectedGradePoint - matchedGradePoint);
        }

        return sum + (course.credits || 0) * selectedGradePoint;
    }, 0);

    const predictedAddedCredits = curr.reduce((sum, course) => {
        const matchedGrade = gradePool[normalizeCourseCode(course.courseCode)];
        if (matchedGrade) {
            return sum;
        }

        return sum + (course.credits || 0);
    }, 0);
    const extraSemesterCredits = extraSemesters.reduce((sum, semester) => sum + getNumberInputValue(semester.credits), 0);
    const extraSemesterCreditPoints = extraSemesters.reduce((sum, semester) => {
        const credits = getNumberInputValue(semester.credits);
        const gpa = getNumberInputValue(semester.gpa);
        return sum + (credits * gpa);
    }, 0);
    const predictedSemesterCredits = curr.reduce((sum, course) => sum + (course.credits || 0), 0);
    const predictedTotalCredits = currentCredits + predictedAddedCredits + extraSemesterCredits;
    const predictedCgpa = predictedTotalCredits > 0
        ? ((currentCgpa * currentCredits) + predictedCreditPoints + extraSemesterCreditPoints) / predictedTotalCredits
        : 0;
    const predictedGpa = predictedSemesterCredits > 0
        ? predictedSemesterCreditPoints / predictedSemesterCredits
        : 0;

    const handleAddSemester = () => {
        setExtraSemesters((prev) => {
            const nextId = Math.max(0, ...prev.map((semester) => semester.id)) + 1;
            return [
                ...prev,
                { id: nextId, credits: "", gpa: "" }
            ];
        });
    };

    const handleSemesterChange = (id, field, value) => {
        setExtraSemesters((prev) => prev.map((semester) => (
            semester.id === id
                ? { ...semester, [field]: value }
                : semester
        )));
    };

    const handleRemoveSemester = (id) => {
        setExtraSemesters((prev) => prev.filter((semester) => semester.id !== id));
    };

    return (
        <div className="col-span-full p-3 rounded-lg shadow bg-white dark:bg-slate-800 midnight:bg-black">
            <div className="mb-2 text-center">
                <span className="text-lg font-semibold dark:text-green-400">
                    Predict CGPA
                </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
                <div className="rounded-lg border border-blue-200 dark:border-blue-800 midnight:border-blue-900 p-3 bg-blue-50 dark:bg-blue-950/40 midnight:bg-blue-950/20">
                    <p className="text-xs text-blue-700 dark:text-blue-300">Current CGPA</p>
                    <p className="text-xl font-bold text-blue-800 dark:text-blue-200">{currentCgpa.toFixed(2)}</p>
                </div>
                <div className="rounded-lg border border-gray-200 dark:border-slate-700 midnight:border-gray-800 p-3">
                    <p className="text-xs text-gray-600 dark:text-gray-300 midnight:text-gray-400">Current Credits</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100 midnight:text-gray-200">{currentCredits.toFixed(1)}</p>
                </div>
                <div className="rounded-lg border border-gray-200 dark:border-slate-700 midnight:border-gray-800 p-3">
                    <p className="text-xs text-gray-600 dark:text-gray-300 midnight:text-gray-400">Predicted GPA</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100 midnight:text-gray-200">{predictedGpa.toFixed(2)}</p>
                </div>
                <div className="rounded-lg border border-green-200 dark:border-green-800 midnight:border-green-900 p-3 bg-green-50 dark:bg-green-950/40 midnight:bg-green-950/20">
                    <p className="text-xs text-green-700 dark:text-green-300">Predicted CGPA</p>
                    <p className="text-xl font-bold text-green-800 dark:text-green-200">{predictedCgpa.toFixed(2)}</p>
                </div>
            </div>

            <div className="mb-5 rounded-lg border border-gray-200 dark:border-slate-700 midnight:border-gray-800 p-4">
                <div className="flex flex-col text-center items-center gap-3 mb-3">
                    <div className="mb-2 text-center justify-center">
                        <span className="text-lg font-semibold dark:text-green-400">
                            Per Sem Predictor
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={handleAddSemester}
                        className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                    >
                        <Plus className="h-4 w-4" />
                        Add Sem
                    </button>
                </div>

                <AnimatePresence initial={false}>
                    {extraSemesters.length > 0 && (
                        <motion.div
                            key="extra-semesters"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="overflow-hidden"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                                <AnimatePresence initial={false}>
                                    {extraSemesters.map((semester, idx) => (
                                        <motion.div
                                            key={semester.id}
                                            layout
                                            initial={{ opacity: 0, y: -10, scale: 0.98 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -8, scale: 0.98 }}
                                            transition={{ duration: 0.2, ease: "easeOut" }}
                                            className="rounded-lg border border-gray-200 dark:border-slate-700 midnight:border-gray-800 p-3"
                                        >
                                            <div className="flex items-center justify-between gap-2 mb-3">
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 midnight:text-gray-100">
                                                    Semester {SemestersCompleted + idx + 1}
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveSemester(semester.id)}
                                                    aria-label={`Remove semester ${SemestersCompleted + idx + 1}`}
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40 midnight:hover:bg-red-950/30"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <label className="text-sm text-gray-700 dark:text-gray-300 midnight:text-gray-300">
                                                    Credits
                                                    <input
                                                        type="text"
                                                        inputMode="decimal"
                                                        value={semester.credits}
                                                        onChange={(e) => handleSemesterChange(semester.id, "credits", e.target.value)}
                                                        placeholder="Credits"
                                                        className="mt-1 w-full rounded-md border border-gray-300 dark:border-slate-600 midnight:border-gray-700 bg-white dark:bg-slate-900 midnight:bg-black px-3 py-2 text-sm text-gray-900 dark:text-gray-100 midnight:text-gray-100"
                                                    />
                                                </label>
                                                <label className="text-sm text-gray-700 dark:text-gray-300 midnight:text-gray-300">
                                                    GPA
                                                    <input
                                                        type="text"
                                                        inputMode="decimal"
                                                        value={semester.gpa}
                                                        onChange={(e) => handleSemesterChange(semester.id, "gpa", e.target.value)}
                                                        placeholder="GPA"
                                                        className="mt-1 w-full rounded-md border border-gray-300 dark:border-slate-600 midnight:border-gray-700 bg-white dark:bg-slate-900 midnight:bg-black px-3 py-2 text-sm text-gray-900 dark:text-gray-100 midnight:text-gray-100"
                                                    />
                                                </label>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4">
                {curr.map((course, idx) => {
                    const key = `${course.courseCode}-${idx}`;
                    const matchedGrade = gradePool[normalizeCourseCode(course.courseCode)];
                    const selectedGrade = predictedGrades[key] || matchedGrade || "A";
                    return (
                        <div
                            key={key}
                            className={`h-full rounded-lg border p-4 flex flex-col gap-3 ${matchedGrade
                                ? "border-gray-200 bg-gray-100 text-gray-500 dark:border-slate-700 dark:bg-slate-900 midnight:border-gray-800 midnight:bg-gray-950"
                                : "border-gray-200 dark:border-slate-700 midnight:border-gray-800"
                                }`}
                        >
                            <div>
                                <p className={`font-medium text-sm sm:text-base ${matchedGrade
                                    ? "text-gray-500 dark:text-gray-400 midnight:text-gray-500"
                                    : "text-gray-900 dark:text-gray-100 midnight:text-gray-100"
                                    }`}>
                                    {course.courseCode} - {course.courseTitle}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-300 midnight:text-gray-400 mt-1">
                                    Credits: {course.credits}
                                </p>
                            </div>

                            <div className="flex items-center gap-2 mt-auto">
                                <label htmlFor={`grade-${key}`} className="text-sm text-gray-700 dark:text-gray-300 midnight:text-gray-300">
                                    Grade
                                </label>
                                <select
                                    id={`grade-${key}`}
                                    value={selectedGrade}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setPredictedGrades((prev) => ({
                                            ...prev,
                                            [key]: value
                                        }));
                                    }}
                                    className="rounded-md border border-gray-300 dark:border-slate-600 midnight:border-gray-700 bg-white dark:bg-slate-900 midnight:bg-black px-3 py-1.5 text-sm text-gray-900 dark:text-gray-100 midnight:text-gray-100 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500 dark:disabled:bg-slate-800 dark:disabled:text-gray-400 midnight:disabled:bg-gray-900 midnight:disabled:text-gray-500"
                                >
                                    <option value="S">S (10)</option>
                                    <option value="A">A (9)</option>
                                    <option value="B">B (8)</option>
                                    <option value="C">C (7)</option>
                                    <option value="D">D (6)</option>
                                    <option value="E">E (5)</option>
                                    <option value="F">F (0)</option>
                                    <option value="N">N (0)</option>
                                </select>
                            </div>
                            {matchedGrade && !predictedGrades[key] && (
                                <p className="text-xs text-gray-600 dark:text-gray-400 midnight:text-gray-400">
                                    Already counted in grade: {matchedGrade}
                                </p>
                            )}
                            {matchedGrade && predictedGrades[key] && predictedGrades[key] !== matchedGrade && (
                                <p className="text-xs text-blue-600 dark:text-blue-400 midnight:text-blue-400">
                                    Overridden from {matchedGrade} to {predictedGrades[key]}
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
