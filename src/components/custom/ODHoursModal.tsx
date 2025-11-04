"use client";

import { useEffect } from "react";
import { Button } from "../ui/button";
import { X } from "lucide-react";

export default function ODHoursModal({ ODhoursData, onClose }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="rounded-2xl shadow-lg w-11/12 max-w-md max-h-[90vh] overflow-y-auto relative bg-white dark:bg-slate-800 midnight:bg-black midnight:border midnight:border-gray-800">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="top-4 right-4 absolute cursor-pointer hover:bg-gray-200 dark:hover:bg-slate-800 midnight:hover:bg-gray-900"
        >
          <X size={22} className="text-gray-600 dark:text-gray-300 midnight:text-gray-200" />
        </Button>

        <div className="p-6 pb-4">
          <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100 midnight:text-gray-100">
            OD Hours Info
          </h3>

          {ODhoursData && ODhoursData.length > 0 && ODhoursData[0].courses ? (
            <div className="overflow-y-auto max-h-[70vh] custom-scrollbar pr-2">
              {ODhoursData.map((day, idx) => (
                <div key={idx} className="mb-4">
                  <p className="font-semibold text-gray-700 dark:text-gray-200 midnight:text-gray-200">
                    {day.date}
                    <span className="mt-2 text-sm text-gray-500 dark:text-gray-400 midnight:text-gray-400">
                      {" "}
                      ({day.total} Hours)
                    </span>
                  </p>
                  <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 midnight:text-gray-300">
                    {day.courses.map((c, idx) => (
                      <li key={idx}>
                        {c.title} ({c.type})
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-300 midnight:text-gray-300">
              No OD hours recorded. Please reload data.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
