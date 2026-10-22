
import type { Metadata } from "next";
import { Outfit, Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-outfit",
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
      <body className={`${poppins.variable} ${outfit.variable}`}>{children}</body>
    </html>
  );
}
