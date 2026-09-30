"use client";

import { useState } from "react";
import { interestFormHref } from "@/lib/links";

// The announcement from the design system: an aubergine strip with cream type
// centred on it, and the link picked out with a cream rule that turns gold on
// hover. Gold is safe here because the ground is aubergine.

// Sits above the nav in normal flow, so it pushes the bar down at the top of
// the page and scrolls away once the sticky nav takes over.
export default function AnnouncementBar() {
  // Dismissal is deliberately not stored, so the bar is back on every load.
  const [closed, setClosed] = useState(false);
  if (closed) return null;

  return (
    <div className="relative bg-ink text-cream">
      <div className="max-w-[1200px] mx-auto px-10 sm:px-14 py-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-[14px] leading-[1.45]">
        <span>Applications for our intro fellowship are now closed.</span>
        <a
          href={interestFormHref("announcement")}
          className="font-medium text-cream border-b border-cream hover:text-gold hover:border-gold transition-colors"
        >
          Express interest in our fellowship
        </a>
      </div>

      <button
        type="button"
        onClick={() => setClosed(true)}
        aria-label="Dismiss announcement"
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2 text-cream/60 hover:text-cream transition-colors"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden
        >
          <line x1="6" y1="6" x2="18" y2="18" />
          <line x1="6" y1="18" x2="18" y2="6" />
        </svg>
      </button>
    </div>
  );
}
