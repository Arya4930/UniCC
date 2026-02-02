"use client";

import { X, Save, LogOut, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "../../ui/button";
import config from "../../../app/config.json";
import { DropdownToggle } from "../toggle";
import HeatMapComponent from "./HeatMapComponent";
import Links from "./Links";
import Files from "./Files";
import PushNotificationManager from "@/app/pushNotificationManager";

export default function SettingsPage({ handleClose, currSemesterID, setCurrSemesterID, handleLogin, setIsReloading, handleLogOutRequest, password, setPassword }) {
    const [selectedSemester, setSelectedSemester] = useState<string>(currSemesterID);
    const [changedPassword, setChangedPassword] = useState<string>(password);
    const [showPassword, setShowPassword] = useState<boolean>(false);

    const handleSaveSemester = async () => {
        if (!selectedSemester) return;
        setIsReloading(true);
        await handleLogin(selectedSemester);
        setCurrSemesterID(selectedSemester);
        localStorage.setItem("currSemesterID", selectedSemester);
    };

    const handleSavePassword = () => {
        setPassword(changedPassword);
        localStorage.setItem("password", changedPassword);
    }

    useEffect(() => {
        setSelectedSemester(currSemesterID);
    }, [currSemesterID]);

    return (
        <div className="fixed inset-0 z-50 bg-gray-100 dark:bg-slate-900 midnight:bg-black bg-opacity-95 flex flex-col items-center justify-start overflow-y-auto p-6">
            <div className="w-full flex justify-between items-center mb-6 max-w-3xl">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 midnight:text-gray-100">
                    Settings
                </h2>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClose}
                    className="cursor-pointer hover:bg-gray-200 dark:hover:bg-slate-800 midnight:hover:bg-gray-900"
                >
                    <X size={22} className="text-gray-600 dark:text-gray-300 midnight:text-gray-200" />
                </Button>
            </div>

            <div className="w-full max-w-3xl flex items-center justify-between gap-3 mb-6">
                <div className="flex flex-col flex-1">
                    <label
                        htmlFor="semesterSelect"
                        className="text-lg font-semibold text-gray-800 dark:text-gray-200 midnight:text-gray-100 mb-2"
                    >
                        Select Semester
                    </label>

                    <select
                        id="semesterSelect"
                        value={selectedSemester}
                        onChange={(e) => setSelectedSemester(e.target.value)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-slate-800 midnight:bg-black text-gray-800 dark:text-gray-200 midnight:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {config.semesterIDs?.map((id: string, index: number) => (
                            <option key={index} value={id}>
                                {id.endsWith("1") ? `FALLSEM` : `WINTERSEM`} {id.slice(4, -4)}-{id.slice(6, -2)}
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    onClick={handleSaveSemester}
                    disabled={!selectedSemester || selectedSemester === currSemesterID}
                    className={`mt-8 px-4 py-2 rounded-lg font-medium flex items-center justify-center transition-colors ${!selectedSemester || selectedSemester === currSemesterID
                        ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                        }`}
                >
                    <Save className="w-4 h-4 mr-1" />
                    Save
                </button>
            </div>

            <div className="w-full max-w-3xl flex items-center justify-between gap-3 border-t border-gray-300 dark:border-gray-700 midnight:border-gray-800 py-4">
                <div className="flex flex-col flex-1">
                    <label
                        htmlFor="semesterSelect"
                        className="text-lg font-semibold text-gray-800 dark:text-gray-200 midnight:text-gray-100 mb-2"
                    >
                        Change Password{" "}
                        <span className="text-xs text-gray-800 dark:text-gray-600 midnight:text-gray-500">
                            (Inside UniCC)
                        </span>
                    </label>

                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            value={changedPassword}
                            onChange={(e) => setChangedPassword(e.target.value)}
                            placeholder="Enter new password"
                            className="w-full px-4 py-2 pr-12 border border-gray-300 dark:border-gray-700
                                rounded-lg bg-white dark:bg-slate-800 midnight:bg-black
                                text-gray-800 dark:text-gray-200 midnight:text-gray-100
                                focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />

                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2
                                text-gray-500 hover:text-gray-700 hover:cursor-pointer"
                        >
                            <Eye className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <button
                    onClick={handleSavePassword}
                    disabled={!password || changedPassword === password}
                    className={`mt-8 px-4 py-2 rounded-lg font-medium flex items-center justify-center transition-colors ${!password || changedPassword === password
                            ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                        }`}
                >
                    <Save className="w-4 h-4 mr-1" />
                    Save
                </button>
            </div>

            <div className="w-full max-w-3xl border-t border-gray-300 dark:border-gray-700 midnight:border-gray-800 py-4">
                <DropdownToggle />
            </div>
            {/* <div className="w-full max-w-3xl border-t border-gray-300 dark:border-gray-700 midnight:border-gray-800 py-4">
                <HeatMapComponent />
            </div> */}
            <div className="w-full max-w-3xl border-t border-gray-300 dark:border-gray-700 midnight:border-gray-800 py-4">
                <Files />
            </div>
            <div className="w-full max-w-3xl border-t border-gray-300 dark:border-gray-700 midnight:border-gray-800 py-4">
                <Links />
            </div>
            <div className="w-full max-w-3xl border-t border-gray-300 dark:border-gray-700 midnight:border-gray-800 py-4">
                <PushNotificationManager />
            </div>
            <div className="w-full max-w-3xl border-t border-gray-300 dark:border-gray-700 midnight:border-gray-800 pt-5">
                <button
                    onClick={handleLogOutRequest}
                    className="w-full px-4 py-2 rounded-lg font-medium flex items-center justify-center bg-red-600 hover:bg-red-700 text-white transition-colors"
                >
                    <LogOut className="w-4 h-4 mr-1" />
                    Log Out
                </button>
            </div>
        </div>
    );
}
