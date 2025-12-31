import type { Metadata, Viewport } from "next";
import { Providers } from "./providers";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Khatabook Pro - Enterprise Digital Ledger & Bookkeeping Software",
  description: "Enterprise-grade digital ledger and bookkeeping app for managing customers, suppliers, transactions, and reminders with real-time analytics",
  keywords: ["bookkeeping", "ledger", "accounting", "business management", "financial tracking"],
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Khatabook Pro",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://khatabook-pro.app",
    title: "Khatabook Pro - Digital Ledger",
    description: "Enterprise-grade digital ledger and bookkeeping app",
    siteName: "Khatabook Pro",
  },
  twitter: {
    card: "summary_large_image",
    title: "Khatabook Pro",
    description: "Enterprise-grade digital ledger and bookkeeping app",
  },
  verification: {
    google: "google-site-verification",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
