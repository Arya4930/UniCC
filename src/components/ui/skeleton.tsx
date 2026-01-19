import React from "react";

export default function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-gray-200/70 dark:bg-slate-800/80 midnight:bg-gray-900/70 ${className}`}
      aria-hidden="true"
    />
  );
}
