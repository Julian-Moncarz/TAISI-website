"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Pins the hero artwork to the viewport so it stays put while the page
 * scrolls, fading it out over the first screen.
 */
export default function HeroBackdrop({
  children,
  fadeOverScreens = 0.6,
}: {
  children: ReactNode;
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
      {children}
    </div>
  );
}
