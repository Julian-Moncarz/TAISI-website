"use client";

import { useState } from "react";
import { FELLOWSHIP_APPLY_URL, FELLOWSHIP_DEADLINE_SHORT } from "@/lib/links";

// The bar comes in two colourways. Both are the same two brand colours with
// the ground and the type swapped over, so neither is a different design.
const LOOKS = {
  // Misted gold ground, deepest purple on it. 15:1.
  gold: {
    bar: "bg-amber-mist text-plum-deep",
    muted: "text-plum-deep/70",
    link: "border-plum-deep/45 hover:border-plum-deep",
    close: "text-plum-deep/55 hover:text-plum-deep",
  },
  // Purple ground with full-strength gold picking out the link. 7.4:1.
  purple: {
    bar: "bg-plum text-white",
    muted: "text-white/70",
    link: "text-amber border-amber/50 hover:border-amber",
    close: "text-white/60 hover:text-white",
  },
} as const;

// Flip this one word to switch the bar over.
const COLOURWAY: keyof typeof LOOKS = "purple";

// Sits above the nav in normal flow, so it pushes the bar down at the top of
// the page and scrolls away once the sticky nav takes over.
export default function AnnouncementBar() {
  // Dismissal is deliberately not stored, so the bar is back on every load.
  const [closed, setClosed] = useState(false);
  if (closed) return null;

  const look = LOOKS[COLOURWAY];

  return (
    <div className={`relative ${look.bar}`}>
      <div className="max-w-[1200px] mx-auto px-10 sm:px-14 py-3.5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[14px] sm:text-[15px] leading-[1.45]">
        <span>
          <span className="font-semibold">
            Applications are open for our intro fellowship.
          </span>{" "}
          <span className={look.muted}>{FELLOWSHIP_DEADLINE_SHORT} EoD.</span>
        </span>
        <span className="flex items-center gap-x-4">
          <a
            href={FELLOWSHIP_APPLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`font-semibold border-b transition-colors ${look.link}`}
          >
            Apply now
          </a>
        </span>
      </div>

      <button
        type="button"
        onClick={() => setClosed(true)}
        aria-label="Dismiss announcement"
        className={`absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2 transition-colors ${look.close}`}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <line x1="6" y1="6" x2="18" y2="18" />
          <line x1="6" y1="18" x2="18" y2="6" />
        </svg>
      </button>
    </div>
  );
}
