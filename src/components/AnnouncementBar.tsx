"use client";

import { useState } from "react";

const APPLY_URL =
  "https://airtable.com/appqa2EUC5hPmar8N/pagFl42KCDDQpw0nm/form";
const DETAILS_URL =
  "https://docs.google.com/document/d/19etrimeNR91Jd3jUL8Qk4wDTDhW93IQh_KJt2-TfWog/edit";

// Sits above the nav in normal flow, so it pushes the bar down at the top of
// the page and scrolls away once the sticky nav takes over.
export default function AnnouncementBar() {
  // Dismissal is deliberately not stored, so the bar is back on every load.
  const [closed, setClosed] = useState(false);
  if (closed) return null;

  return (
    <div className="relative bg-navy text-white">
      <div className="max-w-[1200px] mx-auto px-10 sm:px-14 py-2.5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[13px] sm:text-[14px] leading-[1.45]">
        <span>
          <span className="font-medium">TAISI is growing.</span>{" "}
          <span className="text-white/75">Priority deadline Aug 22.</span>
        </span>
        <span className="flex items-center gap-x-4">
          <a
            href={DETAILS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="border-b border-white/40 hover:border-white transition-colors"
          >
            Role details
          </a>
          <a
            href={APPLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="border-b border-white/40 hover:border-white transition-colors"
          >
            Apply now
          </a>
        </span>
      </div>

      <button
        type="button"
        onClick={() => setClosed(true)}
        aria-label="Dismiss announcement"
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2 text-white/60 hover:text-white transition-colors"
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
