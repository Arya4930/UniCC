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
    <div className="w-full px-4 mb-6">
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* First Row - Attendance and OD Hours */}
        <div 
          className="cursor-pointer p-4 bg-white rounded-2xl shadow hover:shadow-lg transition"
          onClick={() => console.log("Attendance clicked")}
        >
          <h2 className="text-sm font-semibold text-gray-600 mb-1">Attendance</h2>
          <p className="text-2xl font-bold text-gray-900">
            {attendancePercentage}%
          </p>
        </div>

        <div 
          className="cursor-pointer p-4 bg-white rounded-2xl shadow hover:shadow-lg transition"
          onClick={() => setODhoursIsOpen(true)}
        >
          <h2 className="text-sm font-semibold text-gray-600 mb-1">OD hours</h2>
          <p className="text-2xl font-bold text-gray-900">{totalODHours}/40</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {/* Second Row - CGPA and Credits */}
        <div 
          className="cursor-pointer p-4 bg-white rounded-2xl shadow hover:shadow-lg transition"
          onClick={() => console.log("CGPA clicked")}
        >
          <h2 className="text-sm font-semibold text-gray-600 mb-1">CGPA</h2>
          <p className="text-2xl font-bold text-gray-900">
            {GradesData?.cgpa?.cgpa || 'N/A'}
          </p>
        </div>

        <div 
          className="cursor-pointer p-4 bg-white rounded-2xl shadow hover:shadow-lg transition"
          onClick={() => setGradesDisplayIsOpen(true)}
        >
          <h2 className="text-sm font-semibold text-gray-600 mb-1">Credits</h2>
          <p className="text-2xl font-bold text-gray-900">
            {GradesData?.cgpa?.creditsEarned || 'N/A'}
          </p>
        </div>
      </div>
    </div>
  );
}