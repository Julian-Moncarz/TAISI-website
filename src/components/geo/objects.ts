// The approved objects for the site: the favourites from the "TAISI
// Geometric Objects" design file, which the "Site Animated Object Bank" file
// also lists. geo-lib.jsx holds dozens more exploratory ones; only these are
// meant to appear on the site, so GeoObject accepts only these names.
export const GEO_OBJECTS = [
  { kind: "logo", label: "Logo cone", note: "The logo on its own: a ring seen from above spins and tips toward you into the mark." },
  { kind: "armillary", label: "Armillary", note: "Three nested bands tumble on different axes, then lock into line one by one." },
  { kind: "shards", label: "Shards", note: "Fourteen uneven shards tumble in and fit together into the logo cone." },
  { kind: "implode", label: "Implode", note: "Twenty-two panels rush in to close into a cylinder." },
  { kind: "telescope", label: "Telescope", note: "Three nested rings extend into a stepped tower." },
  { kind: "stack", label: "Stack", note: "Four solid discs drop one at a time onto the pile." },
  { kind: "unroll", label: "Unroll", note: "A tall cylinder tips over and unrolls into a flat square." },
  { kind: "coin", label: "Coin toss", note: "Tossed end over end twice, lands, hops once." },
  { kind: "gyre", label: "Gyre", note: "Its lean circles four times like a slowing gyroscope." },
  { kind: "ratchet", label: "Ratchet", note: "Turns in nine clicks that speed up, then ease off." },
  { kind: "bounce", label: "Bounce", note: "Drops in, squashes, and bounces twice before settling." },
  { kind: "weave", label: "Weave", note: "Five stacked rings twist against each other and stop offset." },
  { kind: "fold", label: "Fold", note: "A flat strip of four panels folds into a square tube." },
  { kind: "crate", label: "Crate", note: "An open box, broken into fifteen uneven shards, tumbles together as it turns." },
  { kind: "globe", label: "Globe cage", note: "A wire globe’s meridians fold shut like a fan, leaving horizon lines." },
] as const;

export type GeoKind = (typeof GEO_OBJECTS)[number]["kind"];
