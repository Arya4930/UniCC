import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { BackgroundSyncQueue, Serwist } from "serwist";
import { defaultCache } from "@serwist/next/worker";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

self.skipWaiting();

self.addEventListener("activate", () => self.clients.claim());

const queue = new BackgroundSyncQueue("myQueueName");

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  precacheOptions: {
    cleanupOutdatedCaches: true,
    concurrency: 10,
    ignoreURLParametersMatching: [],
  },
  skipWaiting: false,
  clientsClaim: false,
  navigationPreload: false,
  disableDevLogs: true,
  runtimeCaching: defaultCache,
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method === "POST" && url.origin === location.origin && url.pathname === "/legacy-post") {
    const backgroundSync = async () => {
      try {
        const response = await fetch(event.request.clone());
        return response;
      } catch (error) {
        await queue.pushRequest({ request: event.request });
        return Response.error();
      }
    };
    event.respondWith(backgroundSync());
  }
});

serwist.addEventListeners();