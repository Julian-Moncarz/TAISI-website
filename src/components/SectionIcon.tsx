"use client";

import { useLayoutEffect, useRef, useState } from "react";
import GeoObject from "./geo/GeoObject";
import type { GeoKind } from "./geo/objects";

// Letters whose edge the eye places further in than their outermost point:
// diagonals that meet the edge at a single point, and rounds that overshoot
// it. In em, on top of the measured ink edge. Straight-sided letters (E, F,
// T, U and the like) need nothing extra.
const OPTICAL_INSET: Record<string, number> = {
  W: 0.06, V: 0.06, Y: 0.05, A: 0.04, X: 0.03,
  O: 0.02, C: 0.02, G: 0.02, Q: 0.02, S: 0.015,
};

/**
 * A section's object, lined up with the heading below it by eye rather than
 * by box. Letters are drawn a little inside their own box (a W or an O sits
 * a few pixels in; a T barely does), so aligning box edges leaves the object
 * visibly outside the heading. This measures where the first letter's ink
 * actually starts and moves the object to match.
 */
export default function SectionIcon({
  kind,
  play = "view",
  className = "",
}: {
  kind: GeoKind;
  play?: "view" | "mount";
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shift, setShift] = useState(0);

  useLayoutEffect(() => {
    const el = ref.current;
    const heading = el?.parentElement?.querySelector(":scope > h1, :scope > h2");
    if (!el || !heading) return;
    const measure = () => {
      const text = heading.textContent?.trimStart() ?? "";
      if (!text) return;
      const s = getComputedStyle(heading);
      const ctx = document.createElement("canvas").getContext("2d");
      if (!ctx) return;
      ctx.font = `${s.fontWeight} ${s.fontSize} ${s.fontFamily}`;
      // actualBoundingBoxLeft is how far the ink reaches left of the pen
      // position: negative when the letter starts to the right of it.
      const ink = Math.max(0, -ctx.measureText(text[0]).actualBoundingBoxLeft);
      setShift(ink + (OPTICAL_INSET[text[0]] ?? 0) * parseFloat(s.fontSize));
    };
    measure();
    // Re-measure once the web font has loaded, and when the heading resizes
    // (its font size follows the viewport).
    document.fonts?.ready.then(measure);
    const ro = new ResizeObserver(measure);
    ro.observe(heading);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={ref} className={`w-[88px] h-[88px] shrink-0 ${className}`} style={{ transform: shift ? `translateX(${shift}px)` : undefined }}>
      <GeoObject kind={kind} play={play} align="start" />
    </div>
  );
}
