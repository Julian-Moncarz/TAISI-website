"use client";

import { useState, useEffect } from "react";

const words = ["researchers", "founders", "policymakers"];

export default function RotatingText() {
  const [index, setIndex] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    const rotate = () => {
      setFading(true);
      setTimeout(() => {
        setIndex((i) => (i + 1) % words.length);
        setFading(false);
      }, 450);
    };
    // The first word waits out the hero's entrance before its own hold starts,
    // so the opening line can be read as written. Shorter than a full turn:
    // holding it the whole way reads as though the cycling has stalled.
    const initial = setTimeout(() => {
      rotate();
      interval = setInterval(rotate, 2800);
    }, 2400);
    return () => {
      clearTimeout(initial);
      if (interval) clearInterval(interval);
    };
  }, []);

  return (
    <span className="relative inline-grid">
      {/* Hidden words to reserve space for the longest */}
      {words.map((w) => (
        <span key={w} className="invisible col-start-1 row-start-1 text-accent">
          {w}
        </span>
      ))}
      {/* Visible rotating word */}
      <span
        className="col-start-1 row-start-1 text-accent transition-opacity duration-[450ms] ease-in-out"
        style={{ opacity: fading ? 0 : 1 }}
      >
        {words[index]}
      </span>
    </span>
  );
}
