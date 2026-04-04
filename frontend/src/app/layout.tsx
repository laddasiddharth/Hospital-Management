import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import Providers from "./providers";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Smart Hospital — Appointment & Queue Management",
  description:
    "Modern hospital appointment booking and real-time queue tracking system for patients, doctors, receptionists, and administrators.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-app">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
