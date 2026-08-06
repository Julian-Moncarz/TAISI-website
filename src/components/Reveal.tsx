"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

// A section that is only just poking above the fold should not play its
// entrance before anyone has scrolled to it, so the trigger box ignores the
// bottom slice of the viewport.
const ENTER_MARGIN = { threshold: 0, rootMargin: "0px 0px -16% 0px" };

// The re-arm box reaches past the bottom of the screen, so an element only
// resets once it is fully out of sight. Sharing one box with the trigger
// would make it fade out again the moment you nudged the scroll back up.
const RESET_MARGIN = { threshold: 0, rootMargin: "0px 0px 80px 0px" };

/**
 * True once the element has scrolled into view. Scrolling back up until it is
 * off the bottom of the screen re-arms it, so coming back down plays the
 * entrance again. Passing out of the top leaves it in place.
 */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }

    const enter = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) setShown(true);
    }, ENTER_MARGIN);

    const reset = new IntersectionObserver((entries) => {
      for (const e of entries) {
        // top > 0 means it left downwards rather than off the top.
        if (!e.isIntersecting && e.boundingClientRect.top > 0) setShown(false);
      }
    }, RESET_MARGIN);

    enter.observe(el);
    reset.observe(el);
    return () => {
      enter.disconnect();
      reset.disconnect();
    };
  }, []);

  return { ref, shown };
}

/** Lifts its children up into place each time they scroll into view. */
export default function Reveal({
  children,
  delay = 0,
  distance,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  distance?: number;
  className?: string;
}) {
  const { ref, shown } = useReveal<HTMLDivElement>();

  const style: CSSProperties = { transitionDelay: `${delay}ms` };
  if (distance !== undefined) {
    (style as Record<string, string>)["--reveal-y"] = `${distance}px`;
  }

  return (
    <div
      ref={ref}
      className={`reveal ${shown ? "reveal-in" : ""} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}
