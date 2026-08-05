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
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
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
        <Nav />
        <div className="flex-1">{children}</div>
        <Footer />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
