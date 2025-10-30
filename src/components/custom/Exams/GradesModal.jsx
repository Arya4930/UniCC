"use client";

import { useEffect } from "react";
import GradesDisplay from "./gradesDisplay";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GradesModal({ GradesData, onClose, handleFetchGrades }) {
  if (!GradesData) {
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="rounded-2xl shadow-lg w-11/12 max-w-md max-h-[90vh] overflow-y-auto relative bg-white dark:bg-slate-800 midnight:bg-black midnight:border midnight:border-gray-800">
          <div className="p-6">
            <p className="text-center text-gray-600 dark:text-gray-300 midnight:text-gray-200">
              No Grades Data Available.{" "}
              <button onClick={handleFetchGrades} className="mt-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors">
                <RefreshCcw className={`w-4 h-4`} />
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="rounded-2xl shadow-lg w-11/12 max-w-md max-h-[90vh] overflow-y-auto relative bg-white dark:bg-slate-800 midnight:bg-black midnight:border midnight:border-gray-800">
        <GradesDisplay data={GradesData} />
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="top-4 right-4 absolute cursor-pointer hover:bg-gray-200 dark:hover:bg-slate-800 midnight:hover:bg-gray-900"
        >
          <X size={22} className="text-gray-600 dark:text-gray-300 midnight:text-gray-200" />
        </Button>
      </div>
    </div>
  );
}