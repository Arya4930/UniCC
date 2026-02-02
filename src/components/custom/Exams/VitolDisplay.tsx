import { useState } from "react";
import { RefreshCcw, CheckCircle, AlertCircle, Clock } from "lucide-react";

export default function vitolDisplay({ vitolData, handleFetchVitol, setVitolData }) {
    if (!vitolData || vitolData.length === 0) {
        return (
            <div className="text-xl mb-4 text-center text-gray-900 dark:text-gray-100 midnight:text-gray-100">
                <h1 className="font-bold">
                    Vitol/LMS Data
                    <button onClick={() => handleFetchVitol()} className="mt-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors">
                        <RefreshCcw className={`w-4 h-4`} />
                    </button>
                </h1>
                <h3 className="font-normal text-base p-2">
                    Nothing here yet? Try refreshing.
                </h3>
                <VitolUserPassForm handleFetchVitol={handleFetchVitol} />
            </div>
        );
    }
    const sortedData = [...vitolData].sort(
        (a, b) => new Date(b.due) - new Date(a.due)
    );

    return (
        <div className="mt-6 p-4">
            <h1 className="text-xl font-bold mb-4 text-center text-gray-900 dark:text-gray-100 midnight:text-gray-100">
                Vitol Upcoming Exams / Assignments
                <button
                    onClick={() => handleFetchVitol()}
                    className="ml-3 inline-flex items-center px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition"
                >
                    <RefreshCcw size={16} />
                </button>
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedData.map((item, idx) => {
                    const isOverdue = !item.done && new Date(item.due) < new Date();
                    const [SemCode, courseName, assignmentName] = item.name.split("|");

                    return (
                        <div
                            key={idx}
                            className="p-4 rounded-lg shadow bg-white dark:bg-slate-800 midnight:bg-black
                                       midnight:outline midnight:outline-1 midnight:outline-gray-800
                                       hover:shadow-md transition cursor-pointer"
                        >
                            <a href={item.url} target="_blank">
                                <div className="flex items-center justify-between">
                                    <h2 className="font-semibold text-gray-900 dark:text-gray-100 midnight:text-gray-200">
                                        {courseName} - {assignmentName}
                                    </h2>

                                    {item.done ? (
                                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                    ) : isOverdue ? (
                                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                                    ) : (
                                        <Clock className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                                    )}
                                </div>
                                <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 midnight:text-gray-300">
                                    <strong>Start(ed):</strong> {item.opens}
                                </p>
                            </a>

                            <div className="mt-3 flex items-center justify-between">
                                <span
                                    className={`px-3 py-1 rounded-full text-xs ${item.done
                                        ? "bg-green-200 text-green-800"
                                        : isOverdue
                                            ? "bg-red-200 text-red-800"
                                            : "bg-yellow-200 text-yellow-800"
                                        }`}
                                >
                                    {item.done ? "Completed" : isOverdue ? "Overdue" : "Pending"}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export function VitolUserPassForm({ handleFetchVitol }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [vitolSite, setVitolSite] = useState("vitolcc");
    async function handleSubmit(e) {
        e.preventDefault();

        if (!username || !password) return;
        await handleFetchVitol(username, password, vitolSite);
        localStorage.setItem("vitol_username", username);
        localStorage.setItem("vitol_password", password);
        localStorage.setItem("vitol_site", vitolSite);
        window.location.reload();
    }

    return (
        <div className="flex flex-col items-center justify-center gap-6 p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 midnight:text-gray-100">
                Enter Vitol Credentials
            </h2>

            <form
                onSubmit={handleSubmit}
                className="flex flex-col w-full max-w-sm gap-4"
            >
                <div className="flex flex-col text-left">
                    <label
                        className="text-sm font-medium text-gray-700 dark:text-gray-300 midnight:text-gray-200 mb-1"
                    >
                        Vitol Site
                    </label>
                    <select
                        className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900
                            dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100
                            midnight:bg-[#0f172a] midnight:text-gray-100
                            focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        value={vitolSite}
                        onChange={(e) => setVitolSite(e.target.value)}
                    >
                        <option value="vitolcc">https://vitolcc.vit.ac.in/</option>
                        <option value="vitolcc1">https://vitolcc1.vit.ac.in/</option>
                    </select>
                </div>

                <div className="flex flex-col text-left">
                    <label
                        className="text-sm font-medium text-gray-700 dark:text-gray-300 midnight:text-gray-200 mb-1"
                    >
                        Username (Registration No.)
                    </label>
                    <input
                        className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 
                        dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100
                        midnight:bg-[#0f172a] midnight:text-gray-100
                        focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        placeholder="Enter Vitol username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>

                <div className="flex flex-col text-left">
                    <label
                        className="text-sm font-medium text-gray-700 dark:text-gray-300 midnight:text-gray-200 mb-1"
                    >
                        Password
                    </label>
                    <input
                        type="password"
                        className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 
                        dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100
                        midnight:bg-[#0f172a] midnight:text-gray-100
                        focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        placeholder="Enter Vitol password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <button
                    type="submit"
                    className="px-6 py-2 rounded-md font-medium text-white bg-blue-600 hover:bg-blue-700 
                        dark:bg-blue-500 dark:hover:bg-blue-600
                        midnight:bg-blue-500 midnight:hover:bg-blue-600
                        transition-colors duration-150"
                >
                    Continue
                </button>
            </form>
        </div>
    );
}
