// src/app/layout.tsx

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your dashboard app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className="min-h-screen bg-blue-400"
        suppressHydrationWarning={true} // ✅ prevents hydration mismatch from Grammarly etc.
      >
        {children}
      </body>
    </html>
  );
}
