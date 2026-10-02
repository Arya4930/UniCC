"use client";

import { useState } from "react";
import { ArrowUpRight, Check, Copy } from "lucide-react";

const NEW_URL = "https://unicc.arya22.dev/";

export default function DomainMigration() {
  const [copied, setCopied] = useState(false);

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(NEW_URL);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      /* The visible address remains selectable if clipboard access is blocked. */
    }
  };

  return (
    <main className="flex min-h-dvh items-center justify-center bg-gray-100 px-5 py-8 text-foreground transition-colors duration-300 dark:bg-slate-900 midnight:bg-black">
      <section className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-colors duration-300 dark:border-slate-700 dark:bg-slate-800 midnight:border-neutral-800 midnight:bg-neutral-950 sm:p-8">

        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          We&apos;re moving to a new home.
        </h1>
        <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-slate-400 midnight:text-neutral-400">
          <strong className="font-semibold text-foreground">uni-cc.site</strong> will be
          discontinued from{" "}
          <strong className="font-semibold text-foreground">29 October</strong>. Please use
          the new address from now on.
        </p>

        <div className="mt-6 flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 p-2 pl-4 dark:border-slate-700 dark:bg-slate-900 midnight:border-neutral-800 midnight:bg-black">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-500">
              New address
            </p>
            <p className="truncate text-sm font-semibold">unicc.arya22.dev</p>
          </div>
          <button
            type="button"
            onClick={copyAddress}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-gray-700 dark:bg-slate-700 dark:hover:bg-slate-600 midnight:bg-neutral-800 midnight:hover:bg-neutral-700"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>

        <a
          href={NEW_URL}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          Open new Uni CC <ArrowUpRight size={18} />
        </a>

        <p className="mt-5 text-center text-xs text-gray-500 dark:text-slate-500">
          Tip: add the new site to your home screen via your browser&apos;s share or menu
          options, and update any saved bookmarks.
        </p>
      </section>
    </main>
  );
}