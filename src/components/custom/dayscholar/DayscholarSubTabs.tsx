import React from 'react';
import { Bus, IndianRupee, Settings } from 'lucide-react';

interface DayscholarSubTabsProps {
  activeSubTab: string;
  setActiveSubTab: (tab: string) => void;
}

const DayscholarSubTabs: React.FC<DayscholarSubTabsProps> = ({
  activeSubTab,
  setActiveSubTab,
}) => {
  return (
    <div className="flex justify-around bg-white dark:bg-gray-800 midnight:bg-gray-900 p-2 rounded-t-xl md:rounded-xl shadow-sm mb-4 md:mb-6">
      <button
        onClick={() => setActiveSubTab("finder")}
        className={`flex flex-col items-center p-2 md:p-3 w-1/2 rounded-lg transition-colors ${
          activeSubTab === "finder"
            ? "bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 midnight:bg-blue-900/40 midnight:text-blue-400"
            : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50 midnight:hover:bg-gray-800/50"
        }`}
      >
        <Bus size={20} className="mb-1" />
        <span className="text-xs md:text-sm font-medium">Bus Finder</span>
      </button>
      <button
        onClick={() => setActiveSubTab("fees")}
        className={`flex flex-col items-center p-2 md:p-3 w-1/3 rounded-lg transition-colors ${
          activeSubTab === "fees"
            ? "bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 midnight:bg-blue-900/40 midnight:text-blue-400"
            : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50 midnight:hover:bg-gray-800/50"
        }`}
      >
        <IndianRupee size={20} className="mb-1" />
        <span className="text-xs md:text-sm font-medium">Fees & Info</span>
      </button>
    </div>
  );
};

export default DayscholarSubTabs;
