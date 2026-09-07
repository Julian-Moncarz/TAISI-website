/* The mark, inlined rather than loaded as a file so the single-colour variant
   can take its fill from the surrounding text colour.

   Two levels of detail. The full mark is the one drawn for print: a downward
   triangle with a web of amber lines across its left half. That web collapses
   into mud below roughly 60px, so anything nav-sized uses `compact`, which
   keeps only the three structural strokes and thickens them to hold up. Both
   share the same triangle and the same line geometry, so they read as one
   mark at any size. */

const TRIANGLE = "M0 0H1000L500 988Z";

// The strokes that carry the shape: the top edge, the left diagonal, and the
// stem down the centre.
const STRUCTURE = "M-20 10H500M1.1 -20L526.4 1018M500 0V1018";

// The finer web drawn inside the left half. Print and large display only.
const FACETS =
  "M228.6 10L81.9 139.7M228.6 10L500 255.2M383.4 10L500 255.2M81.9 139.7L326.8 103.6M81.9 139.7L342.1 446.1M326.8 103.6L343.3 474.3M500 255.2L343.3 474.3M220.8 414.1L500 551.2M500 551.2L375.4 719.7";

type Variant = "color" | "mono" | "on-dark";
type Detail = "full" | "compact";

// Stroke weight is set per level of detail: the full mark is drawn at the
// weight it was designed at, the compact one is thickened so a 26px render
// still shows three distinct lines rather than a smudge.
const STROKE: Record<Detail, number> = { full: 20, compact: 48 };

const FIELD: Record<Variant, string> = {
  color: "#501684",
  "on-dark": "#FCF8F1",
  mono: "currentColor",
};

export default function TaisiMark({
  variant = "color",
  detail = "full",
  className,
  title = "TAISI",
}: {
  variant?: Variant;
  detail?: Detail;
  className?: string;
  title?: string;
}) {
  // The id comes from the props rather than a counter: a counter would hand
  // the server and the client different numbers and break hydration, and two
  // marks drawn the same way can share one definition safely.
  const id = `taisi-mark-${variant}-${detail}`;
  const strokeWidth = STROKE[detail];
  const paths = detail === "full" ? [STRUCTURE, FACETS] : [STRUCTURE];

  if (variant === "mono") {
    return (
      <svg viewBox="0 0 1000 988" className={className} role="img" aria-label={title}>
        <mask id={id}>
          <path d={TRIANGLE} fill="#fff" />
          <g fill="none" stroke="#000" strokeWidth={strokeWidth} strokeLinecap="round">
            {paths.map((d) => (
              <path key={d} d={d} />
            ))}
          </g>
        </mask>
        <path d={TRIANGLE} fill="currentColor" mask={`url(#${id})`} />
      </svg>
    );
  }

  // The field carries the brand colour and the lines are cut across it in
  // amber; on dark grounds the field flips to cream and the lines stay.
  return (
    <svg viewBox="0 0 1000 988" className={className} role="img" aria-label={title}>
      <clipPath id={id}>
        <path d={TRIANGLE} />
      </clipPath>
      <path d={TRIANGLE} fill={FIELD[variant]} />
      <g
        clipPath={`url(#${id})`}
        fill="none"
        stroke="#FF9F03"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      >
        {paths.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
    </svg>
  );
}
