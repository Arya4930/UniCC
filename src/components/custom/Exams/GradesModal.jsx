"use client";
import GradesDisplay from "./gradesDisplay";

export default function GradesModal({ GradesData, onClose }) {
  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
      <div className="rounded-2xl shadow-lg w-11/12 max-w-md max-h-[90vh] overflow-y-auto relative">
        <GradesDisplay data={GradesData} />
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