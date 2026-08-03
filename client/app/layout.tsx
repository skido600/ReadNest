import type { Metadata } from "next";

import "./globals.css";
import ConditionalNav from "@/component/ClientComponents/Conditionalshow";
import ConditionalFooter from "@/component/ClientComponents/ConditionalshowFooter";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "next-themes";
import { TanstackQueryProvider } from "./context/TanstackQueryProvider";

export const metadata: Metadata = {
  title: "ReadNest",
  description: "ReadNest Read up",
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
            {children}
            <ConditionalFooter />{" "}
          </ThemeProvider>
        </TanstackQueryProvider>
      </body>
    </html>
  );
}
