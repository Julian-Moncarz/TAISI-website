"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Lockup } from "./Logo";

const links = [
  { href: "/fellowships", label: "Fellowship" },
  { href: "/team", label: "Team" },
];

// How long the mobile menu takes to fade in and out.
const MENU_MS = 200;

export default function Nav() {
  const pathname = usePathname();
  // Mounted and shown are separate so the menu can fade out before it
  // leaves the page.
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(false);
  const [mounted, setMounted] = useState(false);
  // The mobile menu opens under the bar, so it has to clear whatever the
  // sticky wrapper adds up to (the bar, plus an announcement if one is up).
  const barRef = useRef<HTMLElement>(null);
  const [headerH, setHeaderH] = useState(75);

  // Nav links reload the page rather than navigating client side, so every
  // page opens at the top with its objects and entrances playing from the
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

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (open) {
      const el = barRef.current;
      if (el) setHeaderH(Math.round(el.getBoundingClientRect().bottom));
      const id = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(id);
    }
    setShown(false);
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Keep the menu in the page until its fade-out has finished.
  const [present, setPresent] = useState(false);
  useEffect(() => {
    if (open) setPresent(true);
    else {
      const t = setTimeout(() => setPresent(false), MENU_MS);
      return () => clearTimeout(t);
    }
  }, [open]);

  return (
    <>
      <header
        ref={barRef}
        className="relative z-[100] bg-white/90 backdrop-blur-[10px] border-b border-ink/[0.08]"
      >
        <div className="container-site py-4 flex items-center justify-between gap-6">
          {/* The descriptor line is too small to read at nav size, so the
              bar carries the name alone, as in the design system's nav. */}
          <a href="/" onClick={hardNav("/")} aria-label="TAISI home" className="flex no-underline">
            <Lockup size={42} descriptor={false} />
          </a>

          <nav className="hidden md:flex items-center gap-7 text-[15px] font-medium whitespace-nowrap">
            {links.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                onClick={hardNav(href)}
                aria-current={pathname === href ? "page" : undefined}
                className={`transition-colors hover:text-ink ${pathname === href ? "text-ink" : "text-mute"}`}
              >
                {label}
              </a>
            ))}
          </nav>

          <button
            className="md:hidden relative z-[100] p-2 -mr-2 text-ink"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
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
      </header>

      {/* Portaled to body so it escapes the sticky wrapper's stacking context. */}
      {present &&
        mounted &&
        createPortal(
          <div
            className="md:hidden fixed inset-0 bg-page z-[90] transition-opacity ease-[var(--ease-standard)]"
            style={{ paddingTop: headerH, opacity: shown ? 1 : 0, transitionDuration: `${MENU_MS}ms` }}
          >
            <div
              className="container-site pt-8 flex flex-col gap-6 transition-transform ease-[var(--ease-settle)]"
              style={{ transform: shown ? "none" : "translateY(-8px)", transitionDuration: `${MENU_MS + 100}ms` }}
            >
              {links.map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  onClick={hardNav(href)}
                  aria-current={pathname === href ? "page" : undefined}
                  className={`t-h2 self-start text-ink ${
                    pathname === href ? "underline decoration-1 underline-offset-[10px]" : ""
                  }`}
                >
                  {label}
                </a>
              ))}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
