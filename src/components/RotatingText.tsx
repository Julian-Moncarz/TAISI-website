"use client";

import { useState, useEffect } from "react";

const words = ["researchers", "founders", "policymakers"];

export default function RotatingText() {
  const [index, setIndex] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setIndex((i) => (i + 1) % words.length);
        setFading(false);
      }, 300);
    }, 3500);
    return () => clearInterval(interval);
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
        className="col-start-1 row-start-1 text-accent transition-opacity duration-300"
        style={{ opacity: fading ? 0 : 1 }}
      >
        {words[index]}
      </span>
    </span>
  );
}
