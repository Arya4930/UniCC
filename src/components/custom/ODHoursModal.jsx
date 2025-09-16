"use client";

export default function ODHoursModal({ ODhoursData, onClose }) {
  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-600 rounded-2xl p-6 w-80 relative text-white">
        <h3 className="text-xl font-bold mb-4">OD Hours Info</h3>
        
        {ODhoursData && ODhoursData.length > 0 && ODhoursData[0].courses ? (
          ODhoursData.map((day, idx) => (
            <div key={idx}>
              <p className="font-semibold">{day.date}</p>
              <ul className="list-disc ml-6">
                {day && day.courses ? (
                  day.courses.map((course, cIdx) => (
                    <li key={cIdx}>{course}</li>
                  ))
                ) : (
                  <li>Faulty Data Please Reload</li>
                )}
              </ul>
            </div>
          ))
        ) : (
          <p>No OD hours recorded/Reload Data Please.</p>
        )}
        
        <button 
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-900 font-bold hover:cursor-pointer"
          onClick={onClose}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
