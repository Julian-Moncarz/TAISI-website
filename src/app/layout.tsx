import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "TAISI — Toronto AI Safety Student Initiative",
  description:
    "A student group at the University of Toronto focused on mitigating catastrophic risks from advanced AI.",
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
  openGraph: {
    title: "TAISI — Toronto AI Safety Student Initiative",
    description:
      "A student group at the University of Toronto focused on mitigating catastrophic risks from advanced AI.",
    images: ["/logo.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "TAISI — Toronto AI Safety Student Initiative",
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
      <body className="min-h-screen flex flex-col">
        <Nav />
        {children}
      </body>
    </html>
  );
}
