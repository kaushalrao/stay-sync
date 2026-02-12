import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProvider } from "./components/providers/AppProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "StaySync",
  description: "The management tool for hosts",
  manifest: "/manifest.json",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

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
            <main className="flex-1 relative z-10 w-full">
              {children}
            </main>
          </div>
        </AppProvider>
      </body>
    </html>
  );
}