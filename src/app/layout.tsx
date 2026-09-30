import type { Metadata } from "next";
import { Geist, Jost } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { LogoSprite } from "@/components/Logo";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

// Jost Light carries the headings and the wordmark; Geist is the body face.
const display = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-jost",
  display: "swap",
});
const body = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

export const metadata: Metadata = {
  // Social preview images (opengraph-image.tsx, twitter-image.tsx) need an
  // absolute URL.
  metadataBase: new URL("https://taisi.ca"),
  title: "TAISI | Toronto AI Safety Initiative",
  description:
    "An initiative at the University of Toronto focused on mitigating catastrophic risks from advanced AI.",
  // No icons block: src/app/icon.png and src/app/apple-icon.png are picked up
  // by file convention instead, which serves them at a content-hashed URL. A
  // fixed /icon.png path meant browsers kept showing whatever they had cached
  // long after the file changed.
  openGraph: {
    title: "TAISI | Toronto AI Safety Initiative",
    description:
      "An initiative at the University of Toronto focused on mitigating catastrophic risks from advanced AI.",
  },
  twitter: {
    card: "summary_large_image",
    title: "TAISI | Toronto AI Safety Initiative",
    description:
      "An initiative at the University of Toronto focused on mitigating catastrophic risks from advanced AI.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Font variables live on <html> so :root can resolve them: the theme's
    // --font-sans and --font-display tokens point at them.
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="min-h-screen flex flex-col">
        <LogoSprite />
        {/* To show an announcement, render <AnnouncementBar /> above Nav in
            here: the banner and bar then pin together as one sticky block
            rather than each sticking to top: 0 and overlapping. */}
        <div className="sticky top-0 z-[100]">
          <Nav />
        </div>
        <div className="flex-1">{children}</div>
        <Footer />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
