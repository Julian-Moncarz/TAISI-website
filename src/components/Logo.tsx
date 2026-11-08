/* The TAISI mark and lockup.

   The mark is the original TAISI triangle, redrawn: an aubergine triangle
   whose left half is broken into gold facets, with thin aubergine seams
   between the facets and a matching hairline round the edge. It is drawn
   once as a symbol in <LogoSprite /> (rendered by the root layout) and every
   mark on the page is a <use> of it, so the geometry ships once however many
   logos there are. public/brand/taisi-mark.svg is the same drawing. */

// Each facet of the gold half: its corners and its gold.
const FACETS = [
  ["0,0 20,0 7.29,14", "#F4A23A"],
  ["20,0 32,10.4 7.29,14", "#EE8F2C"],
  ["20,0 36,0 50,26", "#F7B95E"],
  ["36,0 50,0 50,26", "#F9CC82"],
  ["7.29,14 32,10.4 34,48.04", "#F7B95E"],
  ["32,10.4 50,26 34,48.04", "#F4A23A"],
  ["7.29,14 34,48.04 21.88,42", "#F9CC82"],
  ["50,26 50,56 34,48.04", "#EE8F2C"],
  ["21.88,42 34,48.04 50,56 37.5,72", "#F4A23A"],
  ["37.5,72 50,56 50,96", "#F7B95E"],
] as const;
// The lines between the gold facets.
const SEAMS =
  "M20,0L7.29,14M20,0L50,26M32,10.4L7.29,14M36,0L50,26M32,10.4L34,48.04M34,48.04L7.29,14M50,26L34,48.04M21.88,42L50,56M50,56L37.5,72";
const PURPLE = "#4A1A7A";
const TRIANGLE = "M0,0H100L50,96Z";
// Seams and edge are drawn at one weight. The edge is stroked at twice that
// and clipped to the triangle, so the half that shows matches the seams.
const SEAM = 0.5;

const MARK_ID = "taisi-mark";
const VIEWBOX = "0 0 100 96";
// Width over height of the mark's viewBox.
const MARK_RATIO = 100 / 96;

/** The shared definition every <TaisiMark /> points at. Render it once. */
export function LogoSprite() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
      <defs>
        <clipPath id={`${MARK_ID}-clip`}>
          <path d={TRIANGLE} />
        </clipPath>
        <symbol id={MARK_ID} viewBox={VIEWBOX}>
          <g clipPath={`url(#${MARK_ID}-clip)`}>
            <path d="M50,0H100L50,96Z" fill={PURPLE} stroke={PURPLE} strokeWidth={0.3} />
            {/* The matching stroke on each facet closes the hairline gaps
                anti-aliasing leaves between neighbouring fills. */}
            {FACETS.map(([points, fill]) => (
              <polygon key={points} points={points} fill={fill} stroke={fill} strokeWidth={0.3} />
            ))}
            <path d={SEAMS} fill="none" stroke={PURPLE} strokeWidth={SEAM} strokeLinecap="round" />
            <path d={TRIANGLE} fill="none" stroke={PURPLE} strokeWidth={SEAM * 2} strokeLinejoin="round" />
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
