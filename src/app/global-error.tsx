"use client";

import { useEffect } from "react";
import ErrorDiagnosticCard from "@/components/custom/ErrorDiagnosticCard";

type ErrorWithDigest = Error & { digest?: string };

export default function GlobalError({
  error,
  reset,
}: {
  error: ErrorWithDigest;
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[UniCC global app error]", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-gray-100 text-foreground transition-colors duration-300 dark:bg-slate-900 midnight:bg-black">
        <ErrorDiagnosticCard
          title="A critical app error occurred"
          description="The app shell failed to render. Copy the full report and send it to support for root-cause analysis."
          error={error}
          onRetry={reset}
        />
      </body>
    </html>
  );
}
