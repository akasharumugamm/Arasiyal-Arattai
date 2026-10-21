
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link rel="preconnect" href="https://cdn.fontshare.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700,900&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
