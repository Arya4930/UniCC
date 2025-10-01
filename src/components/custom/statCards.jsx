"use client";

export default function StatsCards({
  attendancePercentage,
  ODhoursData,
  setODhoursIsOpen,
  GradesData,
  setGradesDisplayIsOpen
}) {
  const totalODHours =
    ODhoursData && ODhoursData.length > 0 && ODhoursData[0].courses
      ? ODhoursData.reduce((sum, day) => sum + day.courses.length, 0)
      : 0;

  const cardBase =
    "cursor-pointer p-6 rounded-2xl shadow hover:shadow-lg transition flex-shrink-0 snap-start w-[calc(50%-8px)]";

  return (
    <div className="overflow-x-auto snap-x snap-mandatory ml-4 mr-4">
      <div className="flex gap-4 py-4 px-2">
        {/* Card 1 */}
        <div
          className={`${cardBase} bg-white dark:bg-slate-800 midnight:bg-black midnight:border midnight:border-gray-800`}
          onClick={() => console.log("Attendance clicked")}
        >
          <h2 className="text-lg font-semibold text-gray-600 dark:text-gray-300 midnight:text-gray-200">Attendance</h2>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 midnight:text-gray-100 mt-2">
            {attendancePercentage}
          </p>
        </div>

        {/* Card 2 */}
        <div
          className={`${cardBase} bg-white dark:bg-slate-800 midnight:bg-black midnight:border midnight:border-gray-800`}
          onClick={() => setODhoursIsOpen(true)}
        >
          <h2 className="text-lg font-semibold text-gray-600 dark:text-gray-300 midnight:text-gray-200">OD hours</h2>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 midnight:text-gray-100 mt-2">
            {totalODHours}/40
          </p>
        </div>

        {/* Card 3 */}
        <div
          className={`${cardBase} bg-white dark:bg-slate-800 midnight:bg-black midnight:border midnight:border-gray-800`}
          onClick={() => console.log("CGPA clicked")}
        >
          <h2 className="text-lg font-semibold text-gray-600 dark:text-gray-300 midnight:text-gray-200">CGPA</h2>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 midnight:text-gray-100 mt-2">
            {GradesData?.cgpa?.cgpa}
          </p>
        </div>

        {/* Card 4 */}
        <div
          className={`${cardBase} bg-white dark:bg-slate-800 midnight:bg-black midnight:border midnight:border-gray-800`}
          onClick={() => setGradesDisplayIsOpen(true)}
        >
          <h2 className="text-lg font-semibold text-gray-600 dark:text-gray-300 midnight:text-gray-200">Credits Earned</h2>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 midnight:text-gray-100 mt-2">
            {GradesData?.cgpa?.creditsEarned}
          </p>
        </div>
      </div>
    </div>
  );
}
