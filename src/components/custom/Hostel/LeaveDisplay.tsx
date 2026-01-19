"use client";
import { useState } from "react";
import { RefreshCcw } from "lucide-react";

export default function LeaveDisplay({ leaveData, handleHostelDetailsFetch }) {
    const [showHistory, setShowHistory] = useState(false);

    if (!leaveData || leaveData.length === 0) {
        return (
            <div className="flex flex-col items-center gap-3 text-gray-600 dark:text-gray-400">
                <p>No leave history available.</p>
                <button onClick={handleHostelDetailsFetch} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors">
                    <RefreshCcw className="w-4 h-4" />
                    Reload data
                </button>
            </div>
        )
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
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-100">Leave details</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Active leave and history overview.</p>
                </div>
                <button onClick={handleHostelDetailsFetch} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors">
                    <RefreshCcw className="w-4 h-4" />
                    Refresh
                </button>
            </div>

            {activeLeave ? (
                <div className="max-w-2xl border border-gray-200 dark:border-slate-800 rounded-2xl p-4 bg-white dark:bg-slate-900/60 text-gray-900 dark:text-gray-100">
                    <h3 className="text-base font-semibold mb-3">Active leave</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <p><strong>Leave ID:</strong> {activeLeave.leaveId}</p>
                        <p><strong>Type:</strong> {activeLeave.leaveType}</p>
                        <p><strong>From:</strong> {activeLeave.from}</p>
                        <p><strong>To:</strong> {activeLeave.to}</p>
                        <p><strong>Reason:</strong> {activeLeave.reason}</p>
                        <p><strong>Place:</strong> {activeLeave.visitPlace}</p>
                        {activeLeave.remarks && (
                            <p>
                                <strong>Remarks:</strong> {activeLeave.remarks}
                            </p>
                        )}
                    </div>
                    <p>
                        <strong>Status:</strong>{" "}
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusClasses(activeLeave.status)}`}>
                            {activeLeave.status}
                        </span>
                    </p>
                </div>
            ) : (
                <p className="text-center text-gray-600 dark:text-gray-400 midnight:text-gray-400 mb-4">
                    No active leave currently.
                </p>
            )}

            {pastLeaves.length > 0 && (
                <div>
                    <button
                        onClick={() => setShowHistory((prev) => !prev)}
                        className="inline-flex items-center px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800 text-sm font-medium transition-colors"
                    >
                        {showHistory ? "Hide leave history" : "Show leave history"}
                    </button>
                </div>
            )}

            {showHistory && pastLeaves.length > 0 && (
                <div data-scrollable className="mt-4 overflow-x-auto rounded-2xl border border-gray-200 dark:border-slate-800">
                    <table className="min-w-full border-collapse table-auto bg-white dark:bg-slate-900/60 text-gray-900 dark:text-gray-100">
                        <thead className="bg-gray-50 dark:bg-slate-800">
                            <tr>
                                <th className="px-4 py-3 text-center border-b border-gray-200 dark:border-slate-800 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                                    Leave ID
                                </th>
                                <th className="px-4 py-3 text-center border-b border-gray-200 dark:border-slate-800 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                                    From
                                </th>
                                <th className="px-4 py-3 text-center border-b border-gray-200 dark:border-slate-800 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                                    To
                                </th>
                                <th className="px-4 py-3 text-center border-b border-gray-200 dark:border-slate-800 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                                    Reason
                                </th>
                                <th className="px-4 py-3 text-center border-b border-gray-200 dark:border-slate-800 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {pastLeaves.map((leave, idx) => (
                                <tr key={idx} className="odd:bg-white even:bg-gray-50 dark:odd:bg-slate-900/50 dark:even:bg-slate-800/60">
                                    <td className="px-4 py-3 text-center border-b border-gray-200 dark:border-slate-800">
                                        {leave.leaveId}
                                    </td>
                                    <td className="px-4 py-3 text-center border-b border-gray-200 dark:border-slate-800">
                                        {leave.from}
                                    </td>
                                    <td className="px-4 py-3 text-center border-b border-gray-200 dark:border-slate-800">
                                        {leave.to}
                                    </td>
                                    <td className="px-4 py-3 text-center border-b border-gray-200 dark:border-slate-800">
                                        {leave.reason}
                                    </td>
                                    <td className="px-4 py-3 text-center border-b border-gray-200 dark:border-slate-800">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusClasses(leave.status)}`}>
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
