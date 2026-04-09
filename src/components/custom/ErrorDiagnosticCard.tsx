"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ErrorWithDigest = Error & { digest?: string };

type RuntimeInfo = {
  href: string;
  userAgent: string;
  language: string;
  platform: string;
  online: boolean;
  referrer: string;
  timestamp: string;
};

type ErrorDiagnosticCardProps = {
  title: string;
  description: string;
  error?: ErrorWithDigest;
  onRetry?: () => void;
};

export default function ErrorDiagnosticCard({
  title,
  description,
  error,
  onRetry,
}: ErrorDiagnosticCardProps) {
  const [copied, setCopied] = useState(false);
  const [runtimeInfo, setRuntimeInfo] = useState<RuntimeInfo | null>(null);

  useEffect(() => {
    setRuntimeInfo({
      href: window.location.href,
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      online: navigator.onLine,
      referrer: document.referrer || "none",
      timestamp: new Date().toISOString(),
    });
  }, []);

  const report = useMemo(() => {
    return {
      title,
      description,
      error: {
        name: error?.name ?? "UnknownError",
        message: error?.message ?? "Unknown client-side exception",
        digest: error?.digest ?? "none",
        stack: error?.stack ?? "stack unavailable",
      },
      runtime: runtimeInfo,
    };
  }, [description, error, runtimeInfo, title]);

  const copyReport = async () => {
    await navigator.clipboard.writeText(JSON.stringify(report, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen w-full bg-gray-100 px-4 text-foreground transition-colors duration-300 dark:bg-slate-900 midnight:bg-black">
      <div className="mx-auto flex min-h-screen w-full max-w-4xl items-center justify-center py-10">
        <Card className="w-full border-gray-300 bg-white shadow-lg dark:border-gray-700 dark:bg-slate-800 midnight:border-gray-800 midnight:bg-[#0a0a0a]">
          <CardHeader>
            <p className="text-sm font-medium text-muted-foreground">UniCC Error Inspector</p>
            <CardTitle className="text-2xl tracking-tight md:text-3xl">{title}</CardTitle>
            <CardDescription className="text-sm md:text-base">{description}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {onRetry ? (
                <Button onClick={onRetry} variant="default">
                  Try again
                </Button>
              ) : null}
              <Button onClick={() => window.location.reload()} variant="secondary">
                Reload page
              </Button>
              <Button asChild variant="outline">
                <Link href="/">Go to dashboard</Link>
              </Button>
              <Button onClick={copyReport} variant="outline">
                {copied ? "Copied" : "Copy full report"}
              </Button>
            </div>

            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="technical">Technical</TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="mt-3">
                <div className="grid gap-3 rounded-lg border border-border bg-background/60 p-4 text-sm">
                  <p>
                    <span className="font-semibold">Message:</span> {error?.message ?? "Unknown client-side exception"}
                  </p>
                  <p>
                    <span className="font-semibold">Digest:</span> {error?.digest ?? "none"}
                  </p>
                  <p>
                    <span className="font-semibold">Page:</span> {runtimeInfo?.href ?? "collecting..."}
                  </p>
                  <p>
                    <span className="font-semibold">When:</span> {runtimeInfo?.timestamp ?? "collecting..."}
                  </p>
                  <p>
                    <span className="font-semibold">Online:</span> {runtimeInfo ? String(runtimeInfo.online) : "collecting..."}
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="technical" className="mt-3">
                <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-lg border border-border bg-background p-3 text-xs leading-relaxed">
                  {JSON.stringify(report, null, 2)}
                </pre>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
