"use client";

import { useEffect } from "react";
import GradesDisplay from "./gradesDisplay";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GradesModal({ GradesData, onClose, handleFetchGrades, marksData, attendance }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={handleBackdropClick}>
      <div className="rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative bg-white dark:bg-slate-900 midnight:bg-black border border-slate-200 dark:border-slate-700 midnight:border-gray-800">
        <GradesDisplay data={GradesData} handleFetchGrades={handleFetchGrades} marksData={marksData} attendance={attendance} />
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="top-4 right-4 absolute cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 midnight:hover:bg-gray-900 rounded-full z-10"
        >
          <X size={20} className="text-slate-600 dark:text-slate-300 midnight:text-slate-200" />
        </Button>
      </div>
    </div>
  );
}