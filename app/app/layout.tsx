
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

export const metadata: Metadata = {
  title: "Arasiyal Arattai",
  description:
    "Arasiyal Arattai is a public platform to explore Tamil Nadu government leaders, departments, schemes, projects and public feedback.",
  icons: { icon: "/aa-logo.svg", shortcut: "/aa-logo.svg", apple: "/aa-logo.svg" },
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
