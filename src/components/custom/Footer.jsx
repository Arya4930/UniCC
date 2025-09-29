"use client";

import { Github } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-transparent text-gray-700 flex items-center justify-center">
      <div className="max-w-7xl mx-auto px-3 py-6 text-center w-full">
        <hr className="border-gray-300 w-9/10 mx-auto mb-4" />
        <div className="text mb-4">
          Made for No reason, By My heart
        </div>
        <div className="flex justify-center items-center gap-3 mb-4">
  <a
    href="https://github.com/Arya4930/UniCC"
    target="_blank"
    rel="noopener noreferrer"
    className="text-gray-600 hover:text-black transition-colors"
    outline="black"
  >
    <Github size={20} />
  </a>

  <span className="text-xs text-gray-600">
    &copy; Arya Evil Inc. All rights reserved.
  </span>
</div>

      </div>
    </footer>
  );
}
