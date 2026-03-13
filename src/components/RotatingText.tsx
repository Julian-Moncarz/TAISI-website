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
    <span
      className="text-accent transition-opacity duration-300"
      style={{ opacity: fading ? 0 : 1 }}
    >
      {words[index]}
    </span>
  );
}
