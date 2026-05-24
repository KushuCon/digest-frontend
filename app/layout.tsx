import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Inter, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import { AuroraBackground } from "@/components/dashboard/aurora-background";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { Toaster } from "sonner";
import { Chatbot } from "@/components/dashboard/chatbot";

const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const display = Instrument_Serif({ subsets: ["latin"], weight: "400", variable: "--font-display", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: "Aperture — Market Intelligence",
  description: "A premium dashboard for portfolio tracking and AI-curated market news.",
  icons: { icon: "/phto.png" },
};

export const viewport: Viewport = { themeColor: "#0a0a0b" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${sans.variable} ${display.variable} ${mono.variable}`}>
      
      <body>
        <AuroraBackground />
        <div className="flex min-h-dvh">
          <Sidebar />
          <div className="flex-1 min-w-0">
            <Topbar />
            <main className="px-4 lg:px-8 py-6 pb-28 lg:pb-10 max-w-[1400px] mx-auto">
              {children}
            </main>
          </div>
        </div>
        <MobileNav />
        <Toaster theme="dark" position="bottom-right" richColors />
        <Chatbot />
      </body>
    </html>
  );
}
