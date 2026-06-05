import type { Metadata } from "next";
import { AuthSync } from "@/components/auth/auth-sync";
import { dmSans, jetbrainsMono } from "@/lib/fonts";
import { RealtimeProvider } from "@/providers/realtime-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/providers/theme-provider";
import "./globals.css";

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
          <AuthSync />
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
