import { Serwist, NetworkFirst, ExpirationPlugin } from "serwist";
import { defaultCache } from "@serwist/next/worker";

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    ...defaultCache,
    {
      matcher: ({ url }) => url.pathname.startsWith("/api/"),
      handler: new NetworkFirst({
        cacheName: "api-cache",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 50,
            maxAgeSeconds: 60 * 60,
          }),
        ],
      }),
    },

    {
      matcher: ({ url }) => url.pathname.startsWith("/.well-known/vercel/"),
      handler: "NetworkOnly",
    },
    {
      matcher: ({ url }) => url.pathname.startsWith("/api/auth/"),
      handler: "NetworkOnly",
    },
  ],

  fallbacks: {
    entries: [
      {
        url: "/~offline",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});
serwist.addEventListeners();