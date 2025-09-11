import { Geist, Geist_Mono, Roboto } from 'next/font/google';
import './globals.css';

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

export const metadata = {
  title: 'Uni CC',
  description:
    'Taking data from VTOP and displaying it in a clean and simple way.',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico'
  },
  manifest: "/manifest.json",
  themeColor: "#317EFB",
};

export default function RootLayout({ children }) {
  return (
      <html lang="en" suppressHydrationWarning>
        <head>
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black" />
          <meta name="apple-mobile-web-app-title" content="My App" />
          <link rel="apple-touch-icon" href="/logo.png" />
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} ${roboto.variable} antialiased`}
        >
          {children}
      </body>
    </html>
  );
}
