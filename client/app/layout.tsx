import type { Metadata } from "next";

import "./globals.css";
import ConditionalNav from "@/component/ClientComponents/Conditionalshow";
import ConditionalFooter from "@/component/ClientComponents/ConditionalshowFooter";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "next-themes";
import { TanstackQueryProvider } from "./context/TanstackQueryProvider";
import ServerStatus from "@/component/ServerStatus";

const siteUrl = "https://read-nest-431c.vercel.app";
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ReadNext | Discover Your Next Great Read",
    template: "%s | ReadNext",
  },
  description:
    "ReadNext is a modern book discovery platform where you can discover, explore, and find your next great book.",
  keywords: [
    "ReadNext",
    "Books",
    "Book Discovery",
    "Book Recommendations",
    "Read Books",
    "Book Platform",
    "Authors",
    "Book Reviews",
    "Genres",
    "Reading",
    "Discover Books",
  ],
  robots: { index: true, follow: true },
  icons: { icon: "/favicon.ico", apple: "/favicon.ico" },
  openGraph: {
    title: "ReadNext | Discover Your Next Great Read",
    description:
      "Discover, explore, and find your next favorite book with ReadNext.",
    url: siteUrl,
    siteName: "ReadNext",
    images: [
      {
        url: `${siteUrl}/logo/white_logo.png`,
        alt: "ReadNext Book Discovery Platform",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ReadNext | Discover Your Next Great Read",
    description:
      "Discover, explore, and find your next favorite book with ReadNext.",
    images: [`${siteUrl}/logo/white_logo.png`],
  },
  alternates: { canonical: siteUrl },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="">
        {" "}
        <TanstackQueryProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <ConditionalNav />
            <Toaster />
            <ServerStatus />
            {children}
            <ConditionalFooter />{" "}
          </ThemeProvider>
        </TanstackQueryProvider>
      </body>
    </html>
  );
}
