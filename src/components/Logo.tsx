/* The TAISI mark and lockup, from "TAISI Web Design System v2".

   The mark is the logo cone seen side on: eleven bands fanning from a point,
   gold on the left to aubergine on the right, cut off by the ellipse of the
   cone's rim. It is drawn once as a symbol in <LogoSprite /> (rendered by the
   root layout) and every mark on the page is a <use> of it, so the gradient
   geometry ships once however many logos there are. */

const BANDS = [
  ["-25,-45.14 -19.19,-38.65 50,100", "oklch(0.84 0.1 80)"],
  ["-19.19,-38.65 -8.98,-32.89 50,100", "oklch(0.8 0.11 67)"],
  ["-8.98,-32.89 4.97,-28.21 50,100", "oklch(0.77 0.12 54)"],
  ["4.97,-28.21 21.79,-24.92 50,100", "oklch(0.73 0.12 41)"],
  ["21.79,-24.92 40.39,-23.22 50,100", "oklch(0.7 0.13 28)"],
  ["40.39,-23.22 59.61,-23.22 50,100", "oklch(0.66 0.14 15)"],
  ["59.61,-23.22 78.21,-24.92 50,100", "oklch(0.6 0.14 -1)"],
  ["78.21,-24.92 95.03,-28.21 50,100", "oklch(0.54 0.14 -17)"],
  ["95.03,-28.21 108.98,-32.89 50,100", "oklch(0.48 0.15 -33)"],
  ["108.98,-32.89 119.19,-38.65 50,100", "oklch(0.42 0.15 -49)"],
  ["119.19,-38.65 125,-45.14 50,100", "oklch(0.36 0.15 -65)"],
] as const;

const MARK_ID = "taisi-mark";
const VIEWBOX = "-1 2.24 102 98.76";
// Width over height of the mark's viewBox.
const MARK_RATIO = 102 / 98.76;

/** The shared definition every <TaisiMark /> points at. Render it once. */
export function LogoSprite() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
      <defs>
        <clipPath id={`${MARK_ID}-clip`}>
          <path d="M50,100L0,3.24A50.83,18 0 0 0 100,3.24Z" />
        </clipPath>
        <symbol id={MARK_ID} viewBox={VIEWBOX}>
          <g clipPath={`url(#${MARK_ID}-clip)`}>
            {BANDS.map(([points, fill]) => (
              <polygon key={points} points={points} fill={fill} />
            ))}
          </g>
        </symbol>
      </defs>
    </svg>
  );
}

/** The mark on its own. `size` is its height in pixels. */
export function TaisiMark({
  size = 42,
  className,
  title,
}: {
  size?: number;
  className?: string;
  title?: string;
}) {
  return (
    <svg
      width={Math.round(size * MARK_RATIO)}
      height={size}
      className={className}
      style={{ display: "block", flexShrink: 0 }}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <use href={`#${MARK_ID}`} />
    </svg>
  );
}

/**
 * Mark, name and descriptor. Every measurement is a fixed proportion of the
 * mark's height, as set in the design file, so the lockup holds together at
 * any size. `tone="dark"` is for aubergine grounds.
 */
export function Lockup({
  size = 42,
  tone = "light",
  descriptor = true,
}: {
  size?: number;
  tone?: "light" | "dark";
  descriptor?: boolean;
}) {
  const name = tone === "dark" ? "var(--color-cream)" : "var(--color-ink)";
  const sub = tone === "dark" ? "var(--color-cream)" : "var(--color-mute)";
  return (
    <span style={{ display: "flex", alignItems: "center" }}>
      <TaisiMark size={size} />
      <span style={{ width: size * 0.4, flexShrink: 0 }} />
      <span style={{ display: "flex", flexDirection: "column", gap: size * 0.17 }}>
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 300,
            fontSize: size * 0.39,
            letterSpacing: "0.26em",
            lineHeight: 0.75,
            color: name,
          }}
        >
          TAISI
        </span>
        {descriptor && (
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 400,
              fontSize: size * 0.15,
              letterSpacing: "0.2em",
              lineHeight: 0.8,
              textTransform: "uppercase",
              whiteSpace: "nowrap",
              color: sub,
              opacity: tone === "dark" ? 0.72 : 1,
            }}
          >
            Toronto AI Safety Initiative
          </span>
        )}
      </span>
    </span>
  );
}
