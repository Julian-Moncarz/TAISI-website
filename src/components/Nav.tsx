"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

const links = [
  { href: "/fellowships", label: "Fellowship" },
  { href: "/intensive", label: "Intensive" },
  { href: "/reach-out", label: "Reach out" },
];

// The bar sits light over the hero and firms up once the page is scrolled.
const WEIGHT_TOP = 400;
const WEIGHT_SCROLLED = 500;

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  // The banner sits above the bar in the same sticky wrapper, so the mobile
  // menu has to clear whatever the two of them add up to.
  const barRef = useRef<HTMLElement>(null);
  const [headerH, setHeaderH] = useState(76);

  // Nav links reload the page rather than navigating client side, so every
  // page opens at the top with its entrance animations running from the
  // start. Modified clicks are left alone so new-tab still works.
  function hardNav(href: string) {
    return (e: React.MouseEvent) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      try {
        history.scrollRestoration = "manual";
      } catch {}
      window.location.href = href;
    };
  }

  const goHome = hardNav("/");

  useEffect(() => { setMounted(true); }, []);

  // Weight follows the scroll position, throttled to a frame so the listener
  // never runs work per scroll event.
  useEffect(() => {
    let queued = false;
    function onScroll() {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        setScrolled(window.scrollY > 24);
      });
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Only the homepage has artwork for the bar to sit lightly over, so every
  // other page keeps the heavier weight throughout.
  const weight =
    pathname === "/" && !scrolled ? WEIGHT_TOP : WEIGHT_SCROLLED;

  // Close mobile menu on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Prevent scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Measure once the menu opens: the sticky wrapper is pinned to the top by
  // then, so the bar's bottom edge is the full header height.
  useEffect(() => {
    if (!open) return;
    const el = barRef.current;
    if (el) setHeaderH(Math.round(el.getBoundingClientRect().bottom));
  }, [open]);

  return (
    <>
      <nav
        ref={barRef}
        className="relative z-[100] backdrop-blur-md bg-white/60"
      >
        <div className="flex items-center justify-between px-5 sm:px-8 md:px-16 lg:px-24 py-5">
          <a href="/" onClick={goHome} className="flex items-center gap-2">
            <Image
              src="/icon.png"
              alt="TAISI"
              width={155}
              height={193}
              priority
              className="h-[32px] sm:h-[38px] w-auto translate-y-[3px]"
            />
            <span className="nav-weight font-sans text-[17px] text-text" style={{ fontWeight: weight }}>
              Toronto AI Safety Initiative
            </span>
          </a>

          {/* Desktop links */}
          <div
            className="nav-weight hidden md:flex items-center gap-8 text-[17px] text-text-secondary"
            style={{ fontWeight: weight }}
          >
            {links.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                onClick={hardNav(href)}
                className={`hover:text-accent transition-colors ${
                  pathname === href ? "text-text" : ""
                }`}
              >
                {label}
              </a>
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
        <div
          className="md:hidden fixed inset-0 bg-white z-[90]"
          style={{ paddingTop: headerH }}
        >
          <div className="flex flex-col px-5 pt-6 gap-6 text-[17px] font-medium">
            {links.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                onClick={hardNav(href)}
                className={`hover:text-accent transition-colors ${
                  pathname === href ? "text-text" : "text-text-secondary"
                }`}
              >
                {label}
              </a>
            ))}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
