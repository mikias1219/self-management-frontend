import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
import { RealtimeProvider } from "@/providers/realtime-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/providers/theme-provider";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-sans-primary",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "LifeOS",
  description: "Personal life management system",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-accent="blue" suppressHydrationWarning>
      <body
        className={`${dmSans.variable} ${jetbrainsMono.variable} min-h-screen font-sans antialiased`}
      >
        <ThemeProvider>
          <RealtimeProvider>
            <TooltipProvider>
              {children}
              <Toaster richColors closeButton />
            </TooltipProvider>
          </RealtimeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
