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
      <div className="bg-gray-600 dark:bg-slate-800 midnight:bg-black p-6 pr-3 w-87 max-h-[80vh] relative text-white dark:text-gray-100 midnight:text-gray-100 rounded-2xl">
        <button
          className="absolute top-2 right-2 text-gray-300 hover:text-white dark:text-gray-400 dark:hover:text-gray-200 midnight:text-gray-400 midnight:hover:text-gray-200 font-bold hover:cursor-pointer"
          onClick={onClose}
        >
          ✕
        </button>

        <div className="overflow-y-auto max-h-[70vh] custom-scrollbar pr-2">
          <h3 className="text-xl font-bold mb-4 text-white dark:text-gray-100 midnight:text-gray-100">OD Hours Info</h3>

          {ODhoursData && ODhoursData.length > 0 && ODhoursData[0].courses ? (
            ODhoursData.map((day, idx) => (
              <div key={idx} className="mb-4">
                <p className="font-semibold text-gray-200 dark:text-gray-300 midnight:text-gray-300">{day.date}<span className="mt-2 text-sm text-gray-400"> ( {day.total} Hours )</span></p>
                <ul>
                  {day.courses.map((c, idx) => (
                    <li key={idx}>
                      {c.title} ({c.type})
                    </li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <p className="text-gray-200 dark:text-gray-300 midnight:text-gray-300">No OD hours recorded/Reload Data Please.</p>
          )}
        </div>
      </div>
    </div>
  );
}
