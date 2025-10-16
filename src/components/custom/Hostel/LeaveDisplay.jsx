"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";

export default function LeaveDisplay({ leaveData, reloadLeaveHistory }) {
    const [showHistory, setShowHistory] = useState(false);

    if (!leaveData || leaveData.length === 0) {
        return (
            <p className="text-center text-gray-600 dark:text-gray-400 midnight:text-gray-400">
                No leave history available.
            </p>
        );
    }

    const parseDate = (dateStr) => {
        const parts = dateStr.split(/[-/ ]/);
        if (parts.length === 3) {
            const [day, monthStr, year] = parts;
            const month = new Date(`${monthStr} 1, 2000`).getMonth();
            return new Date(year, month, parseInt(day));
        }
        return new Date(dateStr);
    };

    const now = new Date();

    const activeLeaves = leaveData.filter((leave) => {
        const from = parseDate(leave.from);
        const to = parseDate(leave.to);
        const daysSinceEnd = (now - to) / (1000 * 60 * 60 * 24);
        return (
            (from <= now && now <= to) ||
            from > now ||
            (daysSinceEnd > 0 && daysSinceEnd <= 3)
        );
    });

    const pastLeaves = leaveData.filter((leave) => !activeLeaves.includes(leave));
    const activeLeave = activeLeaves[0];

    const getStatusClasses = (status) => {
        if (!status) return "bg-gray-500 text-white";

        const normalized = status.toUpperCase().trim();

        if (normalized.includes("REQUEST APPROVED"))
            return "bg-green-500 text-white";
        if (normalized.includes("LEAVE CLOSED"))
            return "bg-green-700 text-white";
        if (normalized.includes("REQUEST PENDING"))
            return "bg-yellow-500 text-black";
        if (normalized.includes("REQUEST CANCELLED BEFORE APPROVAL"))
            return "bg-gray-400 text-black";
        return "bg-red-500 text-white";
    };

    return (
        <div>
            <h1 className="text-xl font-bold mb-2 text-center text-gray-900 dark:text-gray-100 midnight:text-gray-100">
                Leave Details <button onClick={reloadLeaveHistory} className="mt-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors">
                    <RefreshCcw className={`w-4 h-4`} />
                </button>
            </h1>

            {activeLeave ? (
                <div className="max-w-xl mx-auto mb-4 border border-gray-300 dark:border-gray-700 midnight:border-gray-700 rounded-2xl p-4 bg-white dark:bg-slate-800 midnight:bg-black text-gray-900 dark:text-gray-100 midnight:text-gray-100">
                    <h2 className="text-lg font-semibold text-center mb-3">
                        Active Leave
                    </h2>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <p><strong>Leave ID:</strong> {activeLeave.leaveId}</p>
                        <p><strong>Type:</strong> {activeLeave.leaveType}</p>
                        <p><strong>From:</strong> {activeLeave.from}</p>
                        <p><strong>To:</strong> {activeLeave.to}</p>
                        <p><strong>Reason:</strong> {activeLeave.reason}</p>
                        <p><strong>Place:</strong> {activeLeave.visitPlace}</p>
                        <p>
                            <strong>Status:</strong>{" "}
                            <span
                                className={`px-2 py-1 rounded-md font-semibold ${getStatusClasses(
                                    activeLeave.status
                                )}`}
                            >
                                {activeLeave.status}
                            </span>
                        </p>
                        {activeLeave.remarks && (
                            <p>
                                <strong>Remarks:</strong> {activeLeave.remarks}
                            </p>
                        )}
                    </div>
                </div>
            ) : (
                <p className="text-center text-gray-600 dark:text-gray-400 midnight:text-gray-400 mb-4">
                    No active leave currently.
                </p>
            )}

            {pastLeaves.length > 0 && (
                <div className="text-center">
                    <button
                        onClick={() => setShowHistory((prev) => !prev)}
                        className="mt-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
                    >
                        {showHistory ? "Hide Leave History" : "Show Leave History"}
                    </button>
                </div>
            )}

            {showHistory && pastLeaves.length > 0 && (
                <div className="mt-6 overflow-x-auto">
                    <table className="min-w-full border-collapse table-auto bg-white dark:bg-slate-800 midnight:bg-black text-gray-900 dark:text-gray-100 midnight:text-gray-100">
                        <thead className="bg-gray-100 dark:bg-slate-700 midnight:bg-slate-900">
                            <tr>
                                <th className="px-4 py-2 text-center border-b border-gray-300 dark:border-gray-700">
                                    Leave ID
                                </th>
                                <th className="px-4 py-2 text-center border-b border-gray-300 dark:border-gray-700">
                                    From
                                </th>
                                <th className="px-4 py-2 text-center border-b border-gray-300 dark:border-gray-700">
                                    To
                                </th>
                                <th className="px-4 py-2 text-center border-b border-gray-300 dark:border-gray-700">
                                    Reason
                                </th>
                                <th className="px-4 py-2 text-center border-b border-gray-300 dark:border-gray-700">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {pastLeaves.map((leave, idx) => (
                                <tr key={idx}>
                                    <td className="px-4 py-2 text-center border-b border-gray-800 dark:border-gray-700">
                                        {leave.leaveId}
                                    </td>
                                    <td className="px-4 py-2 text-center border-b border-gray-800 dark:border-gray-700">
                                        {leave.from}
                                    </td>
                                    <td className="px-4 py-2 text-center border-b border-gray-800 dark:border-gray-700">
                                        {leave.to}
                                    </td>
                                    <td className="px-4 py-2 text-center border-b border-gray-800 dark:border-gray-700">
                                        {leave.reason}
                                    </td>
                                    <td className="px-4 py-2 text-center border-b border-gray-800 dark:border-gray-700">
                                        <span
                                            className={`px-2 py-1 rounded-md font-semibold ${getStatusClasses(
                                                leave.status
                                            )}`}
                                        >
                                            {leave.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
