"use client";

import { useEffect } from "react";
import { useToast } from "../toast/ToastProvider";

export default function ServiceWorkerRegister() {
  const { notify } = useToast();

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js");

        registration.addEventListener("updatefound", () => {
          const worker = registration.installing;
          if (!worker) return;
          worker.addEventListener("statechange", () => {
            if (worker.state === "installed" && navigator.serviceWorker.controller) {
              notify({
                variant: "info",
                title: "Update available",
                description: "A new version is ready. Refresh to update.",
              });
            }
          });
        });
      } catch {
        // no-op
      }
    };

    register();
  }, [notify]);

  return null;
}
