"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

const links = [
  { href: "/", label: "Home" },
  { href: "/summer-intensive", label: "Summer Intensive" },
  { href: "/fellowships", label: "Fellowships" },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Prevent scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <nav className="sticky top-0 z-[100] bg-white/95 backdrop-blur-sm">
        <div className="flex items-center justify-between px-5 sm:px-8 md:px-16 lg:px-24 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/icon.png"
              alt="TAISI"
              width={155}
              height={193}
              priority
              className="h-[28px] sm:h-[32px] w-auto translate-y-[2px]"
            />
            <span className="text-[15px] sm:text-[17px] font-normal tracking-tight text-text">
              Toronto AI Safety Initiative
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8 text-[15px] font-medium text-text-secondary">
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`hover:text-accent transition-colors ${
                  pathname === href ? "text-text" : ""
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden relative z-[100] p-2 -mr-2"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {open ? (
                <>
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="6" y1="18" x2="18" y2="6" />
                </>
              ) : (
                <>
                  <line x1="4" y1="7" x2="20" y2="7" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="17" x2="20" y2="17" />
                </>
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile menu - portaled to body so it escapes nav stacking context */}
      {open && mounted && createPortal(
        <div className="md:hidden fixed inset-0 bg-white z-[90] pt-[76px]">
          <div className="flex flex-col px-5 pt-6 gap-6 text-[17px] font-medium">
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`hover:text-accent transition-colors ${
                  pathname === href ? "text-text" : "text-text-secondary"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
