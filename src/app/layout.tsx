import type { Metadata } from "next";
import { Libre_Franklin } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

// One family for headings and body, loaded once.
const siteFont = Libre_Franklin({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
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
    images: ["/logo.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "TAISI | Toronto AI Safety Initiative",
    description:
      "An initiative at the University of Toronto focused on mitigating catastrophic risks from advanced AI.",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Font variables live on <html> so :root can resolve them. The --font-sans
    // theme token is declared at :root and points at --font-body, so defining
    // them lower down leaves that token falling back to the system font.
    <html lang="en" className={siteFont.variable}>
      <body className="min-h-screen flex flex-col">
        {/* To show an announcement, render <AnnouncementBar /> above Nav in
            here: the banner and bar then pin together as one sticky block
            rather than each sticking to top: 0 and overlapping. */}
        <div className="sticky top-0 z-[100]">
          <div aria-hidden className="h-1.5 bg-plum" />
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
