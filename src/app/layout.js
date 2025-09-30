import { Geist, Geist_Mono, Roboto } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { ThemeProvider } from "@/components/themeprovider";
import './globals.css';
import ThemeColorUpdater from '@/components/custom/ThemeColorUpdater';

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
const APP_DESCRIPTION = "Taking data from VTOP and displaying it in a clean and simple way.";

export const metadata = {
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

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${roboto.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ThemeColorUpdater />
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
