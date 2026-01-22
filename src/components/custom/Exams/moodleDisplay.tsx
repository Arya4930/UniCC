import { useEffect, useState } from "react";
import { RefreshCcw, CheckCircle, AlertCircle, Clock, Eye, EyeOff, Undo2 } from "lucide-react";

export default function MoodleDisplay({ moodleData, handleFetchMoodle, setMoodleData }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showHidden, setShowHidden] = useState(false);

    useEffect(() => {
        const moodle_username = localStorage.getItem("moodle_username");
        const moodle_password = localStorage.getItem("moodle_password");

        if (moodle_username) setUsername(moodle_username);
        if (moodle_password) setPassword(moodle_password);
    }, []);

    if (!username || !password) {
        return <MoodleUserPassForm handleFetchMoodle={handleFetchMoodle} />;
    }

    if (!moodleData || moodleData.length === 0) {
        return (
            <div className="text-xl mb-4 text-center text-gray-900 dark:text-gray-100 midnight:text-gray-100">
                <h1 className="font-bold">
                    Moodle/LMS Data <button onClick={() => handleFetchMoodle(username, password)} className="mt-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors">
                        <RefreshCcw className={`w-4 h-4`} />
                    </button>
                </h1>
                <h3 className="font-normal text-base p-2">
                    Nothing here yet? Try refreshing.
                </h3>
                <MoodleUserPassForm handleFetchMoodle={handleFetchMoodle} />
            </div>
        );
    }
    const sortedData = [...moodleData].sort(
        (a, b) => new Date(b.due) - new Date(a.due)
    );

    const visibleAssignments = sortedData.filter(
        item => showHidden || !item.hidden
    );

    const hiddenCount = sortedData.filter(item => item.hidden).length;

    const setHiddenState = (url, hidden) => {
        setMoodleData(prev => {
            const updated = prev.map(item =>
                item.url === url ? { ...item, hidden } : item
            );

            localStorage.setItem("moodleData", JSON.stringify(updated));
            return updated;
        });
    };

    return (
        <div className="mt-6 p-4">
            <h1 className="text-xl font-bold mb-4 text-center text-gray-900 dark:text-gray-100 midnight:text-gray-100">
                Moodle Upcoming Exams / Assignments
                <button
                    onClick={() => handleFetchMoodle(username, password)}
                    className="ml-3 inline-flex items-center px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition"
                >
                    <RefreshCcw size={16} />
                </button>
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {visibleAssignments.map((item, idx) => {
                    const isOverdue = !item.done && new Date(item.due) < new Date();
                    const [SemCode, courseName, assignmentName] = item.name.split("/");

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
                                    <strong>Due:</strong> {item.due}
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

                                {!item.hidden ? (
                                    <button
                                        onClick={() => setHiddenState(item.url, true)}
                                        className="text-xs text-gray-500 hover:text-red-600"
                                    >
                                        Not yours? Hide it
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setHiddenState(item.url, false)}
                                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                                    >
                                        <Undo2 size={14} />
                                        Unhide
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            {hiddenCount > 0 && (
                <div className="mt-6 flex items-center justify-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                    <span>{hiddenCount} hidden assignments</span>
                    <button
                        onClick={() => setShowHidden(!showHidden)}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 transition"
                    >
                        {showHidden ? <EyeOff size={14} /> : <Eye size={14} />}
                        {showHidden ? "Hide hidden" : "Show hidden"}
                    </button>
                </div>
            )}
        </div>
    );
}

function MoodleUserPassForm({ handleFetchMoodle }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();

        if (!username || !password) return;
        const res = await handleFetchMoodle(username, password);
        localStorage.setItem("moodle_username", username);
        localStorage.setItem("moodle_password", password);
        window.location.reload();
    }

    return (
        <div className="flex flex-col items-center justify-center gap-6 p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 midnight:text-gray-100">
                Enter Moodle Credentials
            </h2>

            <form
                onSubmit={handleSubmit}
                className="flex flex-col w-full max-w-sm gap-4"
            >
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
                        placeholder="Enter Moodle username"
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
                        placeholder="Enter Moodle password"
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
