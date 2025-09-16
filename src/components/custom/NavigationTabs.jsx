"use client";
import { LogOut, RefreshCcw } from 'lucide-react';

export default function NavigationTabs({
  activeTab,
  setActiveTab,
  handleLogOutRequest,
  handleReloadRequest
}) {
  return (
    <div className="flex w-full pb-2 mb-4">
      <button 
        onClick={handleLogOutRequest}
        className="basis-2/20 flex items-center justify-center bg-red-500 hover:cursor-pointer text-white px-3 py-2 text-sm font-medium hover:bg-red-600 transition-colors"
      >
        <LogOut className="w-4 h-4" />
      </button>

      <button 
        onClick={() => setActiveTab("attendance")}
        className={`basis-9/20 text-sm font-medium transition-colors rounded-none hover:cursor-pointer ${
          activeTab === "attendance" 
            ? "bg-blue-600 text-white hover:bg-blue-700" 
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        }`}
      >
        Attendance
      </button>

      <button 
        onClick={() => setActiveTab("exams")}
        className={`basis-9/20 text-center px-3 py-2 text-sm font-medium hover:cursor-pointer transition-colors ${
          activeTab === "exams" 
            ? "bg-blue-600 text-white" 
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        }`}
      >
        Exams
      </button>

      <button 
        onClick={() => setActiveTab("hostel")}
        className={`basis-9/20 text-center px-3 py-2 text-sm font-medium hover:cursor-pointer transition-colors ${
          activeTab === "hostel" 
            ? "bg-blue-600 text-white" 
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        }`}
      >
        Hostel
      </button>

      <button 
        onClick={handleReloadRequest}
        className="basis-2/20 flex items-center justify-center bg-blue-500 hover:cursor-pointer text-white px-3 py-2 text-sm font-medium hover:bg-blue-700 transition-colors"
      >
        <RefreshCcw className="w-4 h-4" />
      </button>
    </div>
  );
}