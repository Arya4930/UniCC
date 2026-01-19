"use client";

import { useState } from "react";
import { Github, Settings, Link, Database } from "lucide-react";
import { IconToggle } from "../toggle";
import { Button } from "../../ui/button";
import DataPage from "./DataPage";
import PrivacyPolicyPage from "./PrivacyPolicy";
import TermsOfServicePage from "./TermsOfService";

type FooterProps = {
  isLoggedIn: boolean;
}

export default function Footer({ isLoggedIn }: FooterProps) {
  const [showStoragePage, setShowStoragePage] = useState<boolean>(false);
  const [storageData, setStorageData] = useState<Record<string, string | null>>({});
  const [showPolicy, setShowPolicy] = useState<boolean>(false);
  const [showTOS, setShowTOS] = useState<boolean>(false);

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
    <footer
      className={`bg-transparent text-gray-700 dark:text-gray-300 midnight:text-gray-300 w-full ${
        isLoggedIn ? "md:pl-64" : ""
      }`}
    >
      {showStoragePage && isLoggedIn && (
        <DataPage
          handleClose={() => setShowStoragePage(false)}
          handleDeleteItem={handleDeleteItem}
          storageData={storageData}
        />
      )}
      {showPolicy && <PrivacyPolicyPage handleClose={() => setShowPolicy(false)} />}
      {showTOS && <TermsOfServicePage handleClose={() => setShowTOS(false)} />}

      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="border-t border-gray-200 dark:border-gray-800 midnight:border-gray-900 pt-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">UniCC</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Built for students. Designed for clarity.
              </p>
            </div>

            <div className="flex items-center flex-wrap gap-2">
              <Button variant="outline" size="icon" asChild>
                <a
                  href="https://github.com/Arya4930/UniCC"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                >
                  <Github size={18} className="text-gray-600 dark:text-gray-300" />
                </a>
              </Button>
              <Button variant="outline" size="icon" asChild>
                <a
                  href="https://arya22.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Portfolio"
                >
                  <Link size={18} className="text-gray-600 dark:text-gray-300" />
                </a>
              </Button>
              <Button variant="outline" size="icon" onClick={openStoragePage} aria-label="Storage data">
                <Database className="h-[1.1rem] w-[1.1rem]" />
              </Button>
              <IconToggle />
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mt-6 text-xs text-gray-500 dark:text-gray-400">
            <span>
              &copy; {new Date().getFullYear()} Arya Evil Inc. All rights reserved.
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                className="h-7 px-2 underline text-xs text-gray-500 dark:text-gray-400"
                onClick={() => setShowPolicy(true)}
              >
                Privacy Policy
              </Button>
              <span aria-hidden="true">•</span>
              <Button
                variant="ghost"
                className="h-7 px-2 underline text-xs text-gray-500 dark:text-gray-400"
                onClick={() => setShowTOS(true)}
              >
                Terms of Service
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
