
import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
