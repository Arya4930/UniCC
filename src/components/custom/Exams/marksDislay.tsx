import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import Image from "next/image";
import { API_BASE } from "../Main";

const formatNumber = (num) => {
  const numericValue = Number(num);
  if (num == null || isNaN(numericValue)) {
    return "-";
  }
  return Number(numericValue.toFixed(2)).toString();
};

export default function MarksDisplay({ data }) {
  const [openCourse, setOpenCourse] = useState(null);

  const toggleCourse = (slNo) => {
    setOpenCourse(openCourse === slNo ? null : slNo);
  };

  if (!data || !data.courses || data.courses.length === 0) {
    return (
      <div className="p-2">
        <h1 className="text-xl font-bold mb-4 text-center text-gray-900 dark:text-gray-100 midnight:text-gray-100">
          Academic Marks
        </h1>
        <Image src="/chepu/chepu_says_sup.png" alt="No Data" width={300} height={300} className="mx-auto" />
      </div>
    );
  }

  return (
    <div className="p-2">
      <h1 className="text-xl font-bold mb-4 text-center text-gray-900 dark:text-gray-100 midnight:text-gray-100">
        Academic Marks
      </h1>

      {/* Grid for cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.courses.map((course, idx) => {
          const totals = course.assessments.reduce(
            (acc, asm) => {
              acc.max += Number(asm.maxMark) || 0;
              acc.scored += Number(asm.scoredMark) || 0;
              acc.weightPercent += Number(asm.weightagePercent) || 0;
              acc.weighted += Number(asm.weightageMark) || 0;
              return acc;
            },
            { max: 0, scored: 0, weightPercent: 0, weighted: 0 }
          );

          return (
            <div
              key={idx}
              className="p-4 rounded-lg shadow bg-white dark:bg-slate-800 midnight:bg-black midnight:outline midnight:outline-1 midnight:outline-gray-800 cursor-pointer"
              onClick={() => toggleCourse(course.slNo)}
            >
              <div className="flex justify-between items-center">
                <div className="flex flex-col items-start">
                  <span className="font-medium text-gray-800 dark:text-gray-200 midnight:text-gray-200 text-sm sm:text-base max-w-xs break-words">
                    {course.courseCode} - {course.courseTitle}
                  </span>

                  <div className="px-3 py-1 flex items-center justify-center bg-gray-200 dark:bg-slate-700 midnight:bg-gray-900 text-black dark:text-gray-300 midnight:text-gray-300 text-xs rounded-full outline outline-1 outline-gray-700 dark:outline-gray-500 midnight:outline-gray-700 mt-2">
                    {course.courseType}
                  </div>
                </div>

                <div className="w-20 h-20 flex-shrink-0 flex flex-col items-center justify-center ml-4">
                  <CircularProgressbar
                    value={(totals.weighted / totals.weightPercent) * 100 || 0}
                    text={`${formatNumber(totals.weighted)}/${formatNumber(
                      totals.weightPercent
                    )}`}
                    styles={buildStyles({
                      pathColor: "#00ff11ff",
                      textColor: "currentColor",
                      trailColor: "#E5E7EB",
                      strokeLinecap: "round",
                      textSize: "1.2em",
                      pathTransitionDuration: 0.5,
                    })}
                  />
                </div>
              </div>

              {/* Full page modal */}
              {openCourse === course.slNo && (
                <MakrsModal course={course} totals={totals} onClose={() => setOpenCourse(null)} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MakrsModal({ course, totals, onClose }) {
  // prevent scroll in background of modal
  useEffect(() => {
    if (typeof document === "undefined") return;

    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
    };
  }, []);

  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (!(course.courseType === "Theory Only" || course.courseType === "Embedded Theory")) return;
        const response = await fetch(`${API_BASE}/api/attendance/marks?classId=${course.classNbr}`);
        const data = await response.json();
        if(!response.ok) {
          throw new Error(data.error || "Failed to fetch class statistics");
        }
        setStats(data);
      } catch (error) {
        console.error("Error fetching class statistics:", error);
      }
    };
    fetchStats();
  }, [course.classNbr]);

  const dataPoints = stats ? (stats.dataPoints ?? stats.count ?? 0) : 0;

  return (
    <div data-scrollable className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
      <div className="bg-white dark:bg-slate-800 midnight:bg-black rounded-xl shadow-lg p-6 max-w-3xl w-[95%] relative max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100 midnight:text-gray-100">
          {course.courseCode} – {course.courseTitle}
        </h2>
        <p className="mb-1">
          <strong>Faculty:</strong> {course.faculty}
        </p>
        <p className="mb-3">
          <strong>Slot:</strong> {course.slot}
        </p>

        <div className="overflow-x-auto">
          <table className="w-full border mt-2 border-gray-300 dark:border-gray-600 midnight:border-gray-700">
            <thead className="bg-gray-800 text-white dark:bg-slate-700 midnight:bg-gray-900">
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
                <tr
                  key={asmIdx}
                  className="border-gray-300 dark:border-gray-600 midnight:border-gray-700"
                >
                  <td className="border p-2">{asm.title}</td>
                  <td className="border p-2">
                    {formatNumber(asm.maxMark)}
                  </td>
                  <td className="border p-2">
                    {formatNumber(asm.scoredMark)}
                  </td>
                  <td className="border p-2">
                    {formatNumber(asm.weightagePercent)}
                  </td>
                  <td className="border p-2">
                    {formatNumber(asm.weightageMark)}
                  </td>
                </tr>
              ))}

              <tr className="font-bold border-t border-gray-400 dark:border-gray-500 midnight:border-gray-600">
                <td className="border p-2">Total</td>
                <td className="border p-2">
                  {formatNumber(totals.max)}
                </td>
                <td className="border p-2">
                  {formatNumber(totals.scored)}
                </td>
                <td className="border p-2">
                  {formatNumber(totals.weightPercent)}
                </td>
                <td className="border p-2">
                  {formatNumber(totals.weighted)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        {stats && (
          <div className="mt-4 p-4 border rounded text-sm">
            <div className="font-semibold">Beta feature — Grade prediction</div>
            <div className={`mt-2 font-medium ${dataPoints > 0 && dataPoints < 30 ? 'text-red-600 dark:text-red-400 midnight:text-red-400' : 'text-gray-700 dark:text-gray-300 midnight:text-gray-300'}`}>
              {dataPoints > 0 && `Warning: Very low data samples (${dataPoints}). Predictions may be unreliable.`}
            </div>
            <div className="mt-2 text-xs">
              Your marks are temporarily processed to compute class statistics such as averages and grade ranges. We do not permanently store your marks after processing them, and only anonymous overall class statistics are retained.This is an experimental prediction based on available class data. Do not fully rely on this prediction — it may not represent the entire class.
            </div>
          </div>
        )}
        {stats && (
          <div className="overflow-x-auto mt-6">
            <p className="mb-2 text-sm text-gray-700 dark:text-gray-300 midnight:text-gray-300">
              Data points: {dataPoints} | Mean: {formatNumber(stats.mean)} | SD: {formatNumber(stats.sd)}
            </p>
            <table className="w-full border border-gray-300 dark:border-gray-600 midnight:border-gray-700">
              <thead>
                <tr className="bg-gray-200 dark:bg-slate-700 midnight:bg-gray-900">
                  <th
                    colSpan={7}
                    className="border p-3 text-center font-semibold"
                  >
                    Range of Grades
                  </th>
                </tr>

                <tr className="bg-gray-100 dark:bg-slate-800 midnight:bg-black">
                  <th className="border p-2">S</th>
                  <th className="border p-2">A</th>
                  <th className="border p-2">B</th>
                  <th className="border p-2">C</th>
                  <th className="border p-2">D</th>
                  <th className="border p-2">E</th>
                  <th className="border p-2">F</th>
                </tr>
              </thead>

              <tbody>
                {(() => {
                  const mean = stats.mean || 0;
                  const sd = stats.sd || 0;

                  const sBoundary = Math.max(Math.round(mean + 1.5 * sd), 80);
                  const aLower = Math.round(mean + 0.5 * sd);
                  const bLower = Math.round(mean - 0.5 * sd);
                  const cLower = Math.round(mean - 1.0 * sd);
                  const dLower = Math.round(mean - 1.5 * sd);
                  const eLower = Math.min(Math.round(mean - 2.0 * sd), 50);

                  return (
                    <tr>
                      <td className="border p-2 text-center whitespace-nowrap">
                        {`>= ${sBoundary.toFixed(0)}`}
                      </td>

                      <td className="border p-2 text-center whitespace-nowrap">
                        {`>= ${aLower.toFixed(0)} and < ${sBoundary.toFixed(0)}`}
                      </td>

                      <td className="border p-2 text-center whitespace-nowrap">
                        {`>= ${bLower.toFixed(0)} and < ${aLower.toFixed(0)}`}
                      </td>

                      <td className="border p-2 text-center whitespace-nowrap">
                        {`>= ${cLower.toFixed(0)} and < ${bLower.toFixed(0)}`}
                      </td>

                      <td className="border p-2 text-center whitespace-nowrap">
                        {`>= ${dLower.toFixed(0)} and < ${cLower.toFixed(0)}`}
                      </td>

                      <td className="border p-2 text-center whitespace-nowrap">
                        {`>= ${eLower.toFixed(0)} and < ${dLower.toFixed(0)}`}
                      </td>

                      <td className="border p-2 text-center whitespace-nowrap">
                        {`< ${eLower.toFixed(0)}`}
                      </td>
                    </tr>
                  );
                })()}
              </tbody>
            </table>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="top-2 right-2 absolute cursor-pointer hover:bg-gray-200 dark:hover:bg-slate-800 midnight:hover:bg-gray-900"
        >
          <X size={22} className="text-gray-600 dark:text-gray-300 midnight:text-gray-200" />
        </Button>
      </div>
    </div>
  )
}