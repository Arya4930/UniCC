"use client";

import { useState } from "react";
import { Github, Settings, Link } from "lucide-react";
import { ModeToggle } from "./toggle";
import { Button } from "../ui/button";
import DataPage from "./DataPage";
import PrivacyPolicyPage from "./PrivacyPolicy";

type FooterProps = {
  isLoggedIn: boolean;
  currSemesterID: string;
  setCurrSemesterID: (id: string) => void;
  handleLogin: (selectedSemester?: string) => Promise<void>;
  setIsReloading: (isReloading: boolean) => void;
}

export default function Footer({ isLoggedIn, currSemesterID, setCurrSemesterID, handleLogin, setIsReloading }: FooterProps) {
  const [showStoragePage, setShowStoragePage] = useState<boolean>(false);
  const [storageData, setStorageData] = useState<Record<string, string | null>>({});
  const [showPolicy, setShowPolicy] = useState<boolean>(false);

  const openStoragePage = () => {
    const data: Record<string, string> = {};

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      const value = localStorage.getItem(key);
      if (value !== null) data[key] = value;
    }

    const sortedEntries = Object.entries(data).sort(
      (a, b) => (a[1]?.length || 0) - (b[1]?.length || 0)
    );

    const sortedData = Object.fromEntries(sortedEntries);
    const ordered: Record<string, string> = {};

    if (sortedData.username) ordered.username = sortedData.username;
    if (sortedData.password) ordered.password = sortedData.password;
    for (const key in sortedData) {
      if (key !== "username" && key !== "password") {
        ordered[key] = sortedData[key];
      }
    }

    setStorageData(ordered);
    setShowStoragePage(true);
  };

  const handleDeleteItem = (key: string) => {
    localStorage.removeItem(key);
    setStorageData((prev) => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  };

  return (
    <footer className="bg-transparent text-gray-700 dark:text-gray-300 midnight:text-gray-300 flex items-center justify-center">
      {showStoragePage && isLoggedIn && <DataPage handleClose={() => setShowStoragePage(false)} handleDeleteItem={handleDeleteItem} storageData={storageData} currSemesterID={currSemesterID} setCurrSemesterID={setCurrSemesterID} handleLogin={handleLogin} setIsReloading={setIsReloading}/>}
      {showPolicy && <PrivacyPolicyPage handleClose={() => setShowPolicy(false)} />}
      <div className="max-w-7xl mx-auto px-3 py-6 text-center w-full">
        <hr className="border-gray-300 dark:border-gray-700 midnight:border-gray-700 w-11/12 mx-auto mb-6" />

        <div className="flex items-center justify-center gap-2 mb-4">
          <Button variant="outline" size="icon" asChild>
            <a
              href="https://github.com/Arya4930/UniCC"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github
                size={20}
                className="text-gray-600 dark:text-gray-300 midnight:text-gray-300"
              />
            </a>
          </Button>
          <Button variant="outline" size="icon" asChild>
            <a
              href="https://arya22.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Link
                size={20}
                className="text-gray-600 dark:text-gray-300 midnight:text-gray-300"
              />
            </a>
          </Button>

          <p className="text-sm font-medium tracking-wide px-5">
            Made for No reason<br></br>By My heart{" "}
            {/* <span className="ml-2 text-xs text-gray-400">v0.1.3</span> */}
          </p>

          <Button variant="outline" size="icon" onClick={openStoragePage}>
            <Settings className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:-rotate-90" />
          </Button>
          <ModeToggle />
        </div>

        <span className="text-xs text-gray-500 dark:text-gray-400 midnight:text-gray-400 block">
          &copy; {new Date().getFullYear()} Arya Evil Inc. All rights reserved. &nbsp;
          <Button
            variant="ghost"
            className="mt-2 w-18 h-6 underline text-xs text-gray-500 dark:text-gray-400 midnight:text-gray-400"
            onClick={() => setShowPolicy(true)}
          >
            Privacy Policy
          </Button>
        </span>
      </div>
    </footer>
  );
}
