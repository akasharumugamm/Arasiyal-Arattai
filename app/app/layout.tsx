
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Tamil Nadu Government Explorer",
  description:
    "Explore Tamil Nadu government officials, departments, schemes, performance and public records.",
  icons: { icon: "/tvk-logo.png", shortcut: "/tvk-logo.png", apple: "/tvk-logo.png" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
