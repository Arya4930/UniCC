"use client";

import { useState } from "react";
import { Github, Settings, Link } from "lucide-react";
import { ModeToggle } from "./toggle";
import { Button } from "../ui/button";
import DataPage from "./DataPage";

export default function Footer({ isLoggedIn }) {
  const [showStoragePage, setShowStoragePage] = useState(false);
  const [storageData, setStorageData] = useState({});

  const openStoragePage = () => {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      data[key] = localStorage.getItem(key);
    }

    const sortedEntries = Object.entries(data).sort(
      (a, b) => (a[1]?.length || 0) - (b[1]?.length || 0)
    );

    const sortedData = Object.fromEntries(sortedEntries);
    const ordered = {};
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


  const handleDeleteItem = (key) => {
    localStorage.removeItem(key);
    setStorageData((prev) => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  };

  const handleClose = () => setShowStoragePage(false);

  return (
    <footer className="bg-transparent text-gray-700 dark:text-gray-300 midnight:text-gray-300 flex items-center justify-center">
      {showStoragePage && isLoggedIn && <DataPage handleClose={handleClose} handleDeleteItem={handleDeleteItem} storageData={storageData} />}
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

        <span className="text-xs text-gray-500 dark:text-gray-400 midnight:text-gray-400">
          &copy; {new Date().getFullYear()} Arya Evil Inc. All rights reserved.
        </span>
      </div>
    </footer>
  );
}
