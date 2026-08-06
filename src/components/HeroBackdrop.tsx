"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Pins the hero artwork to the viewport so it stays put while the page
 * scrolls, fading it out over the first screen.
 */
export default function HeroBackdrop({
  children,
  withTint = false,
  fadeOverScreens = 0.6,
}: {
  children: ReactNode;
  /** Adds the accent colour filter the homepage sailboats reference. */
  withTint?: boolean;
  /** Fraction of a screen height the artwork takes to fade away. */
  fadeOverScreens?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const el = ref.current;
      if (!el) return;
      const fadeOver = window.innerHeight * fadeOverScreens;
      const opacity = Math.max(0, 1 - window.scrollY / fadeOver);
      el.style.opacity = String(opacity);
      // Stop compositing it once it is gone.
      el.style.visibility = opacity <= 0.01 ? "hidden" : "visible";
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [fadeOverScreens]);

  return (
    <div ref={ref} aria-hidden className="fixed inset-0 -z-10 pointer-events-none">
      {/* Nudges the pencil greys halfway towards the accent: white stays
          white, the lines pick up a warm tint rather than turning orange. */}
      {withTint && (
        <svg width="0" height="0" className="absolute" aria-hidden focusable="false">
          <filter id="accent-tint" colorInterpolationFilters="sRGB">
            <feColorMatrix
              type="matrix"
              values="0.1221 0.4109 0.0415 0 0.4255
                      0.1796 0.6043 0.0610 0 0.1550
                      0.1926 0.6480 0.0654 0 0.0940
                      0      0      0      1 0"
            />
          </filter>
        </svg>
      )}
      {children}
    </div>
  );
}
