"use client";

export default function StatsCards({
  attendancePercentage,
  ODhoursData,
  setODhoursIsOpen,
  GradesData,
  setGradesDisplayIsOpen
}) {
  const totalODHours = ODhoursData && ODhoursData.length > 0 && ODhoursData[0].courses 
    ? ODhoursData.reduce((sum, day) => sum + day.courses.length, 0) 
    : 0;

  return (
    <div className="overflow-x-auto">
      <div className="inline-flex gap-4 py-4 mx-2">
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
          onClick={() => setODhoursIsOpen(true)}
        >
          <h2 className="text-lg font-semibold text-gray-600">OD hours</h2>
          <p className="text-3xl font-bold text-gray-900 mt-2">{totalODHours}/40</p>
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
      </div>
    </div>
  );
}
