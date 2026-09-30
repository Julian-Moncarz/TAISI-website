"use client";

import { useState } from "react";
import GeoObject from "@/components/geo/GeoObject";
import LogoSpin from "@/components/geo/LogoSpin";
import { GEO_OBJECTS } from "@/components/geo/objects";

/** Every approved object, each replayable on click, plus a Play all. */
export function ObjectBank() {
  // Bumping the round remounts every object, which plays it from the start.
  const [round, setRound] = useState(0);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="t-small">Click an object to play it. Each one plays once when it scrolls into view.</p>
        <button type="button" onClick={() => setRound((r) => r + 1)} className="btn btn-ink btn-sm">
          Play all
        </button>
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,240px),1fr))] gap-x-5 gap-y-7">
        {GEO_OBJECTS.map((o, i) => (
          <div key={o.kind} className="flex flex-col gap-2.5">
            <div className="aspect-square bg-cream rounded-lg overflow-hidden p-6">
              <GeoObject key={`${o.kind}-${round}`} kind={o.kind} play={round ? "mount" : "view"} />
            </div>
            <span className="t-label">
              {String(i + 1).padStart(2, "0")} · {o.label}
            </span>
            <span className="text-[14px] leading-[1.45] text-mute text-pretty">{o.note}</span>
            <code className="text-[12px] text-mute">&lt;GeoObject kind=&quot;{o.kind}&quot; /&gt;</code>
          </div>
        ))}
      </div>
    </div>
  );
}

/** The two logo animations, each replayable. */
export function LogoAnimations() {
  const [round, setRound] = useState(0);
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,460px),1fr))] gap-5">
        {[true, false].map((name) => (
          <div key={String(name)} className="flex flex-col gap-2.5">
            <div className="aspect-video bg-cream rounded-lg overflow-hidden">
              <LogoSpin key={round} showName={name} />
            </div>
            <span className="t-small">Logo animation · {name ? "with name" : "mark only"}</span>
          </div>
        ))}
      </div>
      <button type="button" onClick={() => setRound((r) => r + 1)} className="btn btn-ink btn-sm self-start">
        Replay
      </button>
    </div>
  );
}
