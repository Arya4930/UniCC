"use client";

import { X, Save, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "../../ui/button";
import config from "../../../app/config.json";
import { DropdownToggle } from "../toggle";
import HeatMapComponent from "./HeatMapComponent";
import Links from "./Links";
import Files from "./Files";

export default function SettingsPage({ handleClose, currSemesterID, setCurrSemesterID, handleLogin, setIsReloading, handleLogOutRequest }) {
    const [selectedSemester, setSelectedSemester] = useState<string>(currSemesterID);
    const handleSaveSemester = async () => {
        if (!selectedSemester) return;
        setIsReloading(true);
        await handleLogin(selectedSemester);
        setCurrSemesterID(selectedSemester);
        localStorage.setItem("currSemesterID", selectedSemester);
    };

    useEffect(() => {
        setSelectedSemester(currSemesterID);
    }, [currSemesterID]);

    return (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-start justify-center overflow-y-auto p-6">
            <div className="w-full max-w-3xl bg-white dark:bg-slate-900 midnight:bg-black rounded-2xl border border-gray-200 dark:border-slate-800 midnight:border-gray-900 p-6">
                <div className="w-full flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Settings</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Manage preferences and quick actions.</p>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleClose}
                        className="cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800"
                    >
                        <X size={22} className="text-gray-600 dark:text-gray-300" />
                    </Button>
                </div>

                <div className="w-full flex flex-col md:flex-row items-end gap-4 mb-6">
                    <div className="flex flex-col flex-1">
                        <label
                            htmlFor="semesterSelect"
                            className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                        >
                            Semester
                        </label>

                        <select
                            id="semesterSelect"
                            value={selectedSemester}
                            onChange={(e) => setSelectedSemester(e.target.value)}
                            className="px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className={`px-4 py-2 rounded-lg font-medium flex items-center justify-center transition-colors ${!selectedSemester || selectedSemester === currSemesterID
                            ? "bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-slate-800 dark:text-gray-500"
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                            }`}
                    >
                        <Save className="w-4 h-4 mr-1" />
                        Save
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="border-t border-gray-200 dark:border-slate-800 pt-4">
                        <DropdownToggle />
                    </div>
                    {/* <div className="border-t border-gray-200 dark:border-slate-800 pt-4">
                        <HeatMapComponent />
                    </div> */}
                    <div className="border-t border-gray-200 dark:border-slate-800 pt-4">
                        <Files />
                    </div>
                    <div className="border-t border-gray-200 dark:border-slate-800 pt-4">
                        <Links />
                    </div>
                    <div className="border-t border-gray-200 dark:border-slate-800 pt-4">
                        <button
                            onClick={handleLogOutRequest}
                            className="w-full px-4 py-2 rounded-lg font-medium flex items-center justify-center bg-red-600 hover:bg-red-700 text-white transition-colors"
                        >
                            <LogOut className="w-4 h-4 mr-1" />
                            Log Out
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
