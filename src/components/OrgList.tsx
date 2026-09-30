"use client";

import { useState } from "react";

// "fill": the logo file is itself a coloured square, so it fills the tile.
// "mark": a transparent mark, set inside a white tile with room around it.
// Putting every logo on the same tile is what makes them read as one size.
const orgs = [
  ["Anthropic", "Frontier lab doing a lot of safety work", "anthropic-icon.png", "https://www.anthropic.com", "fill"],
  ["METR", "Evaluates frontier models for the top labs", "metr-icon.png", "https://metr.org", "mark"],
  ["Redwood Research", "Pioneered the field of AI control", "redwood-icon.png", "https://www.redwoodresearch.org", "mark"],
  ["University labs", "Grosse, McIlraith, Jin and Papernot at U of T", "uoft.png", "https://www.cs.toronto.edu", "mark"],
  ["MATS", "The top AI safety research fellowship", "mats-icon.png", "https://www.matsprogram.org", "fill"],
  ["Epoch AI", "Data and forecasts on AI progress", "epoch-icon.svg", "https://epoch.ai", "mark"],
  ["GovAI", "Oxford’s AI governance research hub", "govai-icon.jpg", "https://www.governance.ai", "fill"],
  ["80,000 Hours", "Career advice and the AI safety job board", "80k-icon.png", "https://80000hours.org", "mark"],
  ["ARC", "Foundational theory for AI alignment", "arc.png", "https://www.alignment.org", "mark"],
  ["BlueDot Impact", "Runs the field’s flagship courses", "bluedot.png", "https://bluedot.org", "fill"],
  ["Resolution", "Alignment lab backed by a $160M grant", "resolution.png", "https://resolution.org", "mark"],
  ["UK AI Security Institute", "The UK government’s frontier evals lab", "uk-aisi.png", "https://www.aisi.gov.uk", "fill"],
] as const;

/** "Some organizations working on AI safety", collapsed until opened. */
export default function OrgList() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="org-list"
        className="self-start flex items-center gap-2 text-[16px] font-medium text-ink cursor-pointer"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0 transition-transform duration-200 ease-[var(--ease-standard)]"
          style={{ transform: open ? "rotate(90deg)" : undefined }}
        >
          <path d="M9 6l6 6-6 6" />
        </svg>
        Some organizations working on AI safety
      </button>

      {open && (
        <div id="org-list" className="flex flex-col gap-4">
          <div className="cell-grid grid-cols-[repeat(auto-fill,minmax(min(100%,260px),1fr))]">
            {orgs.map(([name, desc, logo, url, tile]) => (
              <a
                key={name}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-6 flex flex-col gap-3.5 text-ink transition-colors duration-200 hover:bg-ink/[0.04]"
              >
                <span
                  className={`w-8 h-8 rounded-[6px] overflow-hidden grid place-items-center bg-page ${
                    tile === "mark" ? "border border-ink/10" : ""
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/logos/${logo}`}
                    alt=""
                    width={32}
                    height={32}
                    className={tile === "fill" ? "w-full h-full object-cover" : "w-5 h-5 object-contain"}
                  />
                </span>
                <span className="flex flex-col gap-1">
                  <span className="text-[16px] font-medium">{name}</span>
                  <span className="text-[14px] leading-[1.5] text-mute">{desc}</span>
                </span>
              </a>
            ))}
          </div>
          <p className="text-[15px] text-mute">
            See more on the{" "}
            <a href="https://www.aisafety.com/map" target="_blank" rel="noopener noreferrer" className="link">
              AI safety field map
            </a>
            .
          </p>
        </div>
      )}
    </div>
  );
}
