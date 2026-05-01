import type { Metadata } from "next";
import { Archivo_Narrow } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const titleFont = Archivo_Narrow({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-title",
});

export const metadata: Metadata = {
  title: "TAISI | Toronto AI Safety Student Initiative",
  description:
    "A student group at the University of Toronto focused on mitigating catastrophic risks from advanced AI.",
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
  openGraph: {
    title: "TAISI | Toronto AI Safety Student Initiative",
    description:
      "A student group at the University of Toronto focused on mitigating catastrophic risks from advanced AI.",
    images: ["/logo.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "TAISI | Toronto AI Safety Student Initiative",
    description:
      "A student group at the University of Toronto focused on mitigating catastrophic risks from advanced AI.",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${titleFont.variable} min-h-screen flex flex-col`}>
        <Nav />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
