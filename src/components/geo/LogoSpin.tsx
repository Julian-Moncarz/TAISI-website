"use client";

import { useEffect, useRef, useState } from "react";

/* The logo animation from "TAISI Logo Animation", ported from its
   composition framework into a standalone component. Seen from directly
   above, the cone is a hollow ring of colour that begins to turn. It tips
   toward you as it spins, its solid outside turning into view, the rim line
   fades and it settles into the mark. With `showName`, the mark then slides
   left and the name fades in beside it.

   Timeline, in seconds: Circle 0, Rise 1.3, Hold 5, Name 6, done 9.2. */

const CUES = { Rise: 1.3, Hold: 5, Name: 6 };
const TOTAL = 9.2;

const R = 50.83;
const H = 106.9;
const EF = Math.asin(18 / R);
const T0 = Math.asin(0.18);
const RAMP = [
  [0.84, 0.1, 80],
  [0.66, 0.14, 15],
  [0.36, 0.15, -65],
];
const N = 10;
const SUB = 11;
const TAU = Math.PI * 2;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;
const easeOutCubic = (t: number) => (t - 1) ** 3 + 1;
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
function animate(start: number, end: number, ease: (t: number) => number) {
  return (t: number) => (t <= start ? 0 : t >= end ? 1 : ease((t - start) / (end - start)));
}
// Slow, slow, then a little faster, settling softly at the end.
const warp = (t: number) => easeInOutSine(Math.pow(clamp(t, 0, 1), 1.7));

function bandColour(i: number) {
  const s = clamp(i / (N - 1), 0, 1) * (RAMP.length - 1);
  const j = Math.min(RAMP.length - 2, Math.floor(s));
  const k = s - j;
  const c = RAMP[j].map((v, n) => v + (RAMP[j + 1][n] - v) * k);
  return `oklch(${c[0].toFixed(3)} ${c[1].toFixed(3)} ${c[2].toFixed(1)})`;
}

const FACES = (() => {
  const out: { a0: number; a1: number; col: string }[] = [];
  const span = Math.PI - 2 * T0;
  const back = TAU - span;
  for (let i = 0; i < N; i++) {
    const col = bandColour(i);
    for (let s = 0; s < SUB; s++) {
      out.push({
        a0: Math.PI - T0 - (span * (i + s / SUB)) / N,
        a1: Math.PI - T0 - (span * (i + (s + 1) / SUB)) / N,
        col,
      });
      out.push({
        a0: Math.PI - T0 + (back * (i + s / SUB)) / N,
        a1: Math.PI - T0 + (back * (i + (s + 1) / SUB)) / N,
        col,
      });
    }
  }
  return out;
})();

function frame(e: number, psi: number) {
  const ce = Math.cos(e);
  const se = Math.sin(e);
  const proj = (phi: number) => [R * Math.cos(phi), -H * ce + R * se * Math.sin(phi)];
  const outer: { pts: string; col: string }[] = [];
  const rim: { x1: number; y1: number; x2: number; y2: number; col: string }[] = [];
  for (const f of FACES) {
    const a0 = f.a0 + psi;
    const a1 = f.a1 + psi;
    const m = (a0 + a1) / 2;
    const visible = -R * se + H * Math.sin(m) * ce;
    const p0 = proj(a0);
    const p1 = proj(a1);
    // Rounded so the server and browser render identical markup: their last
    // floating-point digits differ.
    rim.push({ x1: +p0[0].toFixed(2), y1: +p0[1].toFixed(2), x2: +p1[0].toFixed(2), y2: +p1[1].toFixed(2), col: f.col });
    if (visible > 1e-6) {
      outer.push({
        pts: `0,0 ${p0[0].toFixed(2)},${p0[1].toFixed(2)} ${p1[0].toFixed(2)},${p1[1].toFixed(2)}`,
        col: f.col,
      });
    }
  }
  return { outer, rim };
}

const FINAL_CY = (() => {
  const yTan = -H * Math.cos(EF) + R * Math.sin(EF) * Math.sin(Math.PI - T0);
  return yTan / 2;
})();

const appearAt = animate(0, 0.9, easeOutCubic);
const fillAt = animate(CUES.Hold - 0.6, CUES.Hold + 0.3, easeInOutSine);
const nameAt = animate(CUES.Name, CUES.Name + 1.3, easeInOutCubic);
const textAt = animate(CUES.Name + 0.9, CUES.Name + 2.4, easeInOutSine);

const LINE = {
  vectorEffect: "non-scaling-stroke",
  strokeWidth: 3,
  strokeLinecap: "round",
} as const;

/**
 * Plays once when it mounts (or on click). Under prefers-reduced-motion it
 * shows the finished logo. Fills a 16:9 box.
 */
export default function LogoSpin({
  showName = true,
  className,
}: {
  showName?: boolean;
  className?: string;
}) {
  const [T, setT] = useState(0);
  const raf = useRef(0);
  const still = useRef(false);

  function play() {
    if (still.current) return;
    cancelAnimationFrame(raf.current);
    const t0 = performance.now();
    const step = (now: number) => {
      const t = (now - t0) / 1000;
      setT(Math.min(t, TOTAL));
      if (t < TOTAL) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  }

  useEffect(() => {
    still.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (still.current) setT(TOTAL);
    else play();
    return () => cancelAnimationFrame(raf.current);
  }, []);

  const spinP = warp(T / CUES.Hold);
  const tiltP = warp((T - CUES.Rise) / (CUES.Hold - CUES.Rise));
  const e = Math.PI / 2 + (EF - Math.PI / 2) * tiltP;
  const psi = -TAU * 1.25 * (1 - spinP);
  const appear = appearAt(T);
  const fill = fillAt(T);
  const { outer, rim } = frame(e, psi);
  const cy = FINAL_CY * tiltP;
  const nameP = showName ? nameAt(T) : 0;
  const textP = showName ? textAt(T) : 0;
  const S = 4.6 * (0.94 + 0.06 * appear) * (1 - 0.35 * nameP);
  const X = 960 - 400 * nameP;

  return (
    <svg
      viewBox="0 0 1920 1080"
      className={className}
      onClick={play}
      role="img"
      aria-label="TAISI, Toronto AI Safety Initiative"
      style={{ display: "block", width: "100%", height: "100%", opacity: appear, cursor: "pointer" }}
    >
      <g transform={`translate(${X} 540) scale(${S}) translate(0 ${-cy})`}>
        <g opacity={1 - fill}>
          {rim.map((r, i) => (
            <line key={i} x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2} stroke={r.col} style={LINE} />
          ))}
        </g>
        {outer.map((p, i) => (
          <polygon key={i} points={p.pts} fill={p.col} stroke={p.col} strokeWidth="0.25" strokeLinejoin="round" />
        ))}
      </g>
      {showName && (
        <g opacity={textP} transform={`translate(${Math.max(826, X + 50 * S + 116)} 0)`}>
          <text x="0" y="542" fontFamily="var(--font-jost), Helvetica, sans-serif" fontWeight="300" fontSize="113" letterSpacing="29" fill="var(--color-ink)">
            TAISI
          </text>
          <text x="0" y="616" fontFamily="var(--font-jost), Helvetica, sans-serif" fontWeight="400" fontSize="35" letterSpacing="7" fill="var(--color-mute)">
            TORONTO AI SAFETY INITIATIVE
          </text>
        </g>
      )}
    </svg>
  );
}
