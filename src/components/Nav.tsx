"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

// Jumps to the programs section of the homepage rather than to a page of
// its own. The two programs live in the bar that slides out beneath it.
const PROGRAMS_HREF = "/#programming";

const programLinks = [
  {
    href: "/fellowships",
    label: "Fellowship",
    blurb:
      "6 weekly sessions over free, fancy dinner at Trajectory Labs, an off-campus AI safety hub. Core material in alignment or governance, with other students and an experienced facilitator. No ML background needed.",
  },
  {
    href: "/intensive",
    label: "Intensive",
    blurb:
      "One day a week at an AI safety lab in downtown Toronto, built to fit around a full-time job. Leave with next steps and a plan for how to contribute.",
  },
];

const links = [{ href: "/reach-out", label: "Reach out" }];

// The bar sits light over the hero and firms up once the page is scrolled.
const WEIGHT_TOP = 400;
const WEIGHT_SCROLLED = 500;

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [programsOpen, setProgramsOpen] = useState(false);
  // The banner sits above the bar in the same sticky wrapper, so the mobile
  // menu has to clear whatever the two of them add up to.
  const barRef = useRef<HTMLElement>(null);
  const [headerH, setHeaderH] = useState(76);

  const onProgramsPage = programLinks.some((l) => l.href === pathname);

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
        className={`relative z-[100] backdrop-blur-md transition-colors duration-200 ${
          programsOpen ? "bg-white" : "bg-white/60"
        }`}
        onMouseLeave={() => setProgramsOpen(false)}
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
            {/* Plain anchor: on the homepage the browser smooth-scrolls to
                the section, elsewhere it loads the homepage at it. */}
            <a
              href={PROGRAMS_HREF}
              onMouseEnter={() => setProgramsOpen(true)}
              onFocus={() => setProgramsOpen(true)}
              aria-expanded={programsOpen}
              className={`hover:text-accent transition-colors ${
                onProgramsPage ? "text-text" : ""
              }`}
            >
              Programs
            </a>
            {links.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                onClick={hardNav(href)}
                onMouseEnter={() => setProgramsOpen(false)}
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

        {/* Programs flyout: a full-width panel under the bar rather than a
            dropdown. It is taken out of flow, since the nav is sticky and a
            panel inside it would grow the bar, push every section down and
            cover the content beneath. Animating grid rows lets it open to
            its own height without hardcoding one. */}
        <div
          className={`hidden md:grid absolute left-0 right-0 top-full transition-[grid-template-rows] duration-300 ease-out ${
            programsOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          }`}
          onMouseEnter={() => setProgramsOpen(true)}
        >
          <div className="overflow-hidden">
            <div
              className={`bg-white px-5 sm:px-8 md:px-16 lg:px-24 pt-4 pb-14 transition-opacity duration-200 ${
                programsOpen ? "opacity-100" : "opacity-0"
              }`}
            >
              <div className="flex gap-16 lg:gap-24">
                {/* Section title, sitting under the wordmark */}
                <div className="w-[240px] shrink-0">
                  <p className="hero-title text-[2rem] leading-[1.1] font-semibold text-text">
                    Programs
                  </p>
                  <a
                    href={PROGRAMS_HREF}
                    tabIndex={programsOpen ? 0 : -1}
                    className="mt-4 inline-block border-b border-text pb-1 text-[15px] font-normal text-text hover:text-accent hover:border-accent transition-colors"
                  >
                    See all programs
                  </a>
                </div>

                <div className="grid grid-cols-2 gap-x-16 lg:gap-x-24 gap-y-8 flex-1 max-w-[900px]">
                  {programLinks.map(({ href, label, blurb }) => (
                    <a
                      key={href}
                      href={href}
                      onClick={hardNav(href)}
                      tabIndex={programsOpen ? 0 : -1}
                      className="group block"
                    >
                      <span className="hero-title block text-[1.35rem] leading-[1.2] font-normal text-text group-hover:text-accent transition-colors">
                        {label}
                      </span>
                      <span className="mt-2 block text-[15px] leading-[1.55] font-normal text-text-secondary">
                        {blurb}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu - portaled to body so it escapes nav stacking context */}
      {open && mounted && createPortal(
        <div
          className="md:hidden fixed inset-0 bg-white z-[90]"
          style={{ paddingTop: headerH }}
        >
          <div className="flex flex-col px-5 pt-6 gap-6 text-[17px] font-medium">
            {/* No hover on touch, so the programs sit open beneath the link. */}
            <a
              href={PROGRAMS_HREF}
              className={`hover:text-accent transition-colors ${
                onProgramsPage ? "text-text" : "text-text-secondary"
              }`}
            >
              Programs
            </a>
            <div className="flex flex-col gap-5 pl-4 -mt-1">
              {programLinks.map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  onClick={hardNav(href)}
                  className={`text-[16px] hover:text-accent transition-colors ${
                    pathname === href ? "text-text" : "text-text-secondary"
                  }`}
                >
                  {label}
                </a>
              ))}
            </div>
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
