import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";

import { ThemeProvider } from "@/components/hub/theme-provider";

import "./globals.css";

export const metadata: Metadata = {
  title: "Kapital Funding Hub",
  description: "Financial operations and AI automation platform for Kapital Funding.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="h-full" suppressHydrationWarning>
        <body className="min-h-full font-sans antialiased">
          <ThemeProvider>{children}</ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
