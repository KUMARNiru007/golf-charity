import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "../components/ui/sonner";
import { AuthProvider } from "../components/AuthProvider";

const inter = Inter({ variable: "--font-sans", subsets: ["latin"], display: "swap" });
const spaceGrotesk = Space_Grotesk({ variable: "--font-display", subsets: ["latin"], display: "swap" });
const jetbrainsMono = JetBrains_Mono({ variable: "--font-mono", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: { default: "Golf Charity", template: "%s | Golf Charity" },
  description: "Play golf, support charities, and win prizes.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased bg-zinc-950 text-zinc-50 min-h-screen">
        <AuthProvider>{children}</AuthProvider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}