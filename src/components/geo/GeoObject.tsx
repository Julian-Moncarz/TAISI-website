"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { LIB, Scene, finalBox, firstBox } from "./geo-lib";
import type { GeoKind } from "./objects";

// Objects rest this long past the end of their motion before counting as done,
// matching the design file.
const SETTLE = 0.35;
// A looping object holds each end of its motion this long before reversing.
const LOOP_HOLD = 0.5;
// Every object is scaled so its finished pose has the same visual size: the
// geometric mean of its width and height, in viewBox units (the box is 480).
const FINISHED_SIZE = 290;
// ...but never so large that its longest side leaves the box.
const MAX_SIDE = 450;
// A section object waits until its top has risen above this share of the
// viewport.
const PLAY_LINE = 0.72;
// An object already past the play line when the page loads (a tall screen)
// waits instead until the reader has scrolled this share of the viewport, so
// it never plays on arrival or on the first nudge of the wheel.
const ON_LOAD_SCROLL = 0.2;

// Eases the framing from the opening frame to the finished pose.
const ease = (x: number) => -(Math.cos(Math.PI * x) - 1) / 2;

type Play =
  /** Plays once per visit, when the reader scrolls it into view. Section icons. */
  | "view"
  /** Plays forward then backward forever, while on screen. Page heroes. */
  | "loop"
  /** Plays once when it mounts. */
  | "mount"
  /** Sits in its final pose until clicked. */
  | "none";

/**
 * One of the TAISI geometric objects, drawn as SVG. It fills its box, so size
 * it with the wrapper. `align="start"` pins the finished object to the box's
 * left and bottom edges instead of centring it, so a section icon lines up
 * with the heading beneath it. Clicking replays it. Under
 * prefers-reduced-motion every object shows its final pose and never moves.
 */
export default function GeoObject({
  kind,
  play = "view",
  align = "center",
  className,
  style,
}: {
  kind: GeoKind;
  play?: Play;
  align?: "center" | "start";
  className?: string;
  style?: React.CSSProperties;
}) {
  const def = LIB[kind];
  const done = def.dur + SETTLE;
  // Objects waiting to play show their opening frame, usually an outline, so
  // there is visibly something there before it moves. The server renders the
  // same frame, so nothing pops in when the page hydrates.
  const [T, setT] = useState(play === "none" ? done : 0);
  const [px, setPx] = useState(0);
  const gradId = "geo" + useId().replace(/:/g, "");
  const box = useRef<HTMLDivElement>(null);
  const raf = useRef(0);
  const still = useRef(false);

  function playOnce() {
    if (still.current) return;
    cancelAnimationFrame(raf.current);
    const t0 = performance.now();
    const step = (now: number) => {
      const t = (now - t0) / 1000;
      if (t >= done) {
        setT(done);
        return;
      }
      setT(t);
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  }

  useLayoutEffect(() => {
    still.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (still.current) setT(done);
  }, [done]);

  // Track the drawn size so outlines keep one on-screen weight.
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setPx(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = box.current;
    if (!el || still.current) return;

    if (play === "mount") playOnce();
    if (play === "mount" || play === "none") return () => cancelAnimationFrame(raf.current);

    if (play === "loop") {
      // Forward, hold, backward, hold. Paused while off screen so a hero
      // scrolled away is not redrawing sixty times a second.
      const span = done;
      const cycle = 2 * span + 2 * LOOP_HOLD;
      let t0 = performance.now();
      let pausedAt: number | null = null;
      const step = (now: number) => {
        const c = ((now - t0) / 1000) % cycle;
        setT(c < span ? c : c < span + LOOP_HOLD ? span : c < 2 * span + LOOP_HOLD ? 2 * span + LOOP_HOLD - c : 0);
        raf.current = requestAnimationFrame(step);
      };
      const io = new IntersectionObserver(([e]) => {
        if (e.isIntersecting) {
          if (pausedAt !== null) t0 += performance.now() - pausedAt;
          pausedAt = null;
          cancelAnimationFrame(raf.current);
          raf.current = requestAnimationFrame(step);
        } else {
          pausedAt = performance.now();
          cancelAnimationFrame(raf.current);
        }
      });
      io.observe(el);
      return () => {
        io.disconnect();
        cancelAnimationFrame(raf.current);
      };
    }

    // "view": once per visit, after the reader has scrolled, when the whole
    // object is on screen and has risen past the play line.
    const startY = window.scrollY;
    const r0 = el.getBoundingClientRect();
    const inViewOnLoad = r0.bottom <= innerHeight && r0.top <= innerHeight * PLAY_LINE;
    let queued = false;
    function check() {
      queued = false;
      if (!el) return;
      if (inViewOnLoad && Math.abs(window.scrollY - startY) < innerHeight * ON_LOAD_SCROLL) return;
      const r = el.getBoundingClientRect();
      if (r.top >= 0 && r.bottom <= innerHeight && r.top <= innerHeight * PLAY_LINE) {
        window.removeEventListener("scroll", onScroll);
        playOnce();
      }
    }
    function onScroll() {
      if (queued) return;
      queued = true;
      requestAnimationFrame(check);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf.current);
    };
    // playOnce reads only refs and props captured here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, play, done]);

  // Scale the finished pose to the shared size, then centre it or pin it to
  // the box's bottom-left corner.
  const b = finalBox(def);
  const w = b.x1 - b.x0;
  const h = b.y1 - b.y0;
  const k = Math.min(FINISHED_SIZE / Math.sqrt(w * h), MAX_SIDE / Math.max(w, h));
  let tx = align === "start" ? -240 - b.x0 * k : -((b.x0 + b.x1) / 2) * k;
  let ty = align === "start" ? 240 - b.y1 * k : -((b.y0 + b.y1) / 2) * k;
  let s = k;
  // A pinned object also pins its opening frame, which is often larger than
  // the finished pose: it waits on the same corner (shrunk if it would
  // overflow the box) and eases onto the finished framing as it plays, so
  // both of its resting states line up with the heading.
  if (align === "start") {
    const a = firstBox(def);
    const s0 = Math.min(k, MAX_SIDE / Math.max(a.x1 - a.x0, a.y1 - a.y0));
    const tx0 = -240 - a.x0 * s0;
    const ty0 = 240 - a.y1 * s0;
    const p = ease(Math.min(1, Math.max(0, T / def.dur)));
    tx = tx0 + (tx - tx0) * p;
    ty = ty0 + (ty - ty0) * p;
    s = s0 + (k - s0) * p;
  }
  // Outlines: 1px on icons, growing to 2px on large heroes.
  const onScreen = Math.min(2, Math.max(1, px / 260));
  const strokeWidth = px ? (onScreen * 480) / px / s : 2;

  return (
    <div
      ref={box}
      aria-hidden
      onClick={play === "loop" ? undefined : playOnce}
      className={className}
      style={{ width: "100%", height: "100%", cursor: play === "loop" ? undefined : "pointer", ...style }}
    >
      <svg viewBox="-240 -240 480 480" width="100%" height="100%" style={{ display: "block", overflow: "visible" }}>
        <g transform={`translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${s.toFixed(4)})`}>
          <Scene def={def} T={T} noFade strokeWidth={strokeWidth} gradId={gradId} />
        </g>
      </svg>
    </div>
  );
}
