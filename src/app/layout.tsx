import * as React from "react"
import { Geist, Geist_Mono, Roboto } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { ThemeProvider } from "../components/themeprovider";
import { ToastProvider } from "../components/custom/toast/ToastProvider";
import { GoogleAnalytics } from "@next/third-parties/google";
import { SpeedInsights } from "@vercel/speed-insights/next"
import type { Viewport, Metadata } from "next";
import './globals.css';
import ServiceWorkerRegister from "../components/custom/pwa/ServiceWorkerRegister";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#111827" },
    { media: "(prefers-color-scheme: midnight)", color: "#0f172a" },
  ],
  width: "device-width",
  initialScale: 1.0,
  maximumScale: 1.0,
  userScalable: false,
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const roboto = Roboto({
  variable: '--font-roboto',
  subsets: ['latin'],
  weight: ['400', '700'],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const APP_NAME = "Uni CC";
const APP_DESCRIPTION = "Showing data from VTOP in a clean and simple way.";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_NAME,
    template: "%s - UniCC App",
  },
  description: APP_DESCRIPTION,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_NAME,
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico'
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${roboto.variable} antialiased`}
      >
        <ToastProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="midnight"
            enableSystem
            disableTransitionOnChange
            value={{ light: "light", dark: "dark", midnight: "midnight" }}
          >
            {children}
            <ServiceWorkerRegister />
          </ThemeProvider>
        </ToastProvider>
        <Analytics />
        <SpeedInsights />
      </body>
      <GoogleAnalytics gaId="G-40NYS6B13N" />
    </html>
  );
}
