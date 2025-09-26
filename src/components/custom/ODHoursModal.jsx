"use client";

import { useEffect } from "react";

export default function ODHoursModal({ ODhoursData, onClose }) {
 
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto"; 
    };
  }, []);

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-600 p-6 pr-3 w-80 max-h-[80vh] relative text-white rounded-2xl">
        <button
          className="absolute top-2 right-2 text-gray-300 hover:text-white font-bold hover:cursor-pointer"
          onClick={onClose}
        >
          ✕
        </button>

        <div className="overflow-y-auto max-h-[70vh] custom-scrollbar pr-2">
          <h3 className="text-xl font-bold mb-4">OD Hours Info</h3>

          {ODhoursData && ODhoursData.length > 0 && ODhoursData[0].courses ? (
            ODhoursData.map((day, idx) => (
              <div key={idx} className="mb-4">
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
        </div>
      </div>
    </div>
  );
}
