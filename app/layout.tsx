import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HostPilot",
  description: "The management tool for hosts",
  manifest: "/manifest.json",
};

import { AppProvider } from "./components/providers/AppProvider";
import { Header } from "./components/Header";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppProvider>
          <div className="min-h-screen bg-[#0f172a] font-sans relative flex flex-col shadow-2xl overflow-x-hidden">
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none transform-gpu z-0">
              <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-600/10 rounded-full blur-[100px] will-change-transform" />
              <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-pink-600/10 rounded-full blur-[100px] will-change-transform" />
            </div>
            <Header />
            <main className="flex-1 px-4 lg:px-8 relative z-10 pb-10 w-full max-w-7xl mx-auto">
              {children}
            </main>
          </div>
        </AppProvider>
      </body>
    </html>
  );
}