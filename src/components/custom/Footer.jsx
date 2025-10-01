"use client";

import { Github } from "lucide-react";
import { ModeToggle } from "./toggle";

export default function Footer() {
  return (
    <footer className="bg-transparent text-gray-700 dark:text-gray-300 midnight:text-gray-300 flex items-center justify-center">
      <div className="max-w-7xl mx-auto px-3 py-6 text-center w-full">
        <hr className="border-gray-300 dark:border-gray-700 midnight:border-gray-700 w-11/12 mx-auto mb-6" />

        <div className="flex items-center justify-center gap-6 mb-4">
          <a
            href="https://github.com/Arya4930/UniCC"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center p-2 border border-gray-300 dark:border-gray-600 midnight:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 midnight:hover:bg-gray-800 transition"
          >
            <Github size={20} className="text-gray-600 dark:text-gray-300 midnight:text-gray-300" />
          </a>

          <p className="text-sm font-medium tracking-wide">
            Made for No reason, By My heart
          </p>

          <ModeToggle />
        </div>

        <span className="text-xs text-gray-500 dark:text-gray-400 midnight:text-gray-400">
          &copy; {new Date().getFullYear()} Arya Evil Inc. All rights reserved.
        </span>
      </div>
    </footer>
  );
}
