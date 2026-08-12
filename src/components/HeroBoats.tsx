"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

// Natural size of the skyline drawing.
const ART = { w: 1672, h: 941 };

type Pinned = {
  src: string;
  nat: { w: number; h: number };
  /** Top left of the sprite, in the artwork's own pixels. */
  at: { x: number; y: number };
  z: string;
};

// These sprites were cut out of the skyline, so their homes are exact: the
// coordinates below come from matching each sprite back against the drawing.
// Drawing them there at 1:1 lands each one on the boat it was cut from, at
// any window size. The skyline is sized with `cover`, so it re-crops as the
// window changes shape, and anything pinned to a percentage of the viewport
// slides off its twin.
const PINNED: Pinned[] = [
  // Big boat, with the drifter passing behind it.
  {
    src: "/sailboat-cut-big-v2.png",
    nat: { w: 76, h: 105 },
    at: { x: 1088, y: 740 },
    z: "z-[6]",
  },
  // Smaller boat further out. It sits below the drifter, so the moving boat
  // passes in front of it.
  {
    src: "/sailboat-drift-v1.png",
    nat: { w: 62, h: 80 },
    at: { x: 1326, y: 750 },
    z: "z-[4]",
  },
];

// The boat that drifts across, on the same waterline. Only its height is tied
// to the artwork; the crossing itself stays in viewport units.
const DRIFTER = { src: "/sailboat-drift-v1.png", nat: { w: 62, h: 80 }, y: 750 };

type Rect = { x: number; y: number; w: number; h: number };

export default function HeroBoats() {
  const frame = useRef<HTMLDivElement>(null);
  const [art, setArt] = useState<Rect | null>(null);

  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    let queued = 0;

    const measure = () => {
      queued = 0;
      // Layout size, not the painted rect: the frame carries the same
      // transform as the drawing, and this is the box before it applies.
      const boxW = el.offsetWidth;
      const boxH = el.offsetHeight;
      if (!boxW || !boxH) return;
      // The same rule `background-size: cover` follows.
      const scale = Math.max(boxW / ART.w, boxH / ART.h);
      const w = ART.w * scale;
      const h = ART.h * scale;
      setArt({ x: (boxW - w) / 2, y: (boxH - h) / 2, w, h });
    };

    const onResize = () => {
      if (!queued) queued = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      if (queued) cancelAnimationFrame(queued);
    };
  }, []);

  // How many screen pixels one pixel of the artwork occupies.
  const scale = art ? art.w / ART.w : 1;

  return (
    <div
      ref={frame}
      aria-hidden
      className="hero-frame intro-fade pointer-events-none absolute inset-[-8%]"
      style={{ animationDuration: "1600ms", animationDelay: "300ms" }}
    >
      {art && (
        <>
          {PINNED.map((b) => (
            <div
              key={b.at.x}
              className={`boat-pinned ${b.z}`}
              style={{
                left: art.x + b.at.x * scale,
                top: art.y + b.at.y * scale,
                width: b.nat.w * scale,
              }}
            >
              <Image
                src={b.src}
                alt=""
                width={b.nat.w}
                height={b.nat.h}
                className="w-full h-auto"
              />
            </div>
          ))}

          {/* Drifting right to left across the water */}
          <div
            className="sailboat z-[5]"
            style={
              {
                top: art.y + DRIFTER.y * scale,
                width: DRIFTER.nat.w * scale,
                "--sail-start": "97vw",
                "--sail-end": "29.5vw",
                animationDuration: "95s",
              } as React.CSSProperties
            }
          >
            <Image
              src={DRIFTER.src}
              alt=""
              width={DRIFTER.nat.w}
              height={DRIFTER.nat.h}
              className="w-full h-auto"
            />
          </div>
        </>
      )}
    </div>
  );
}
