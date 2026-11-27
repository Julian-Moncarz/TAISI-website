"""Generate assets/shards/shard-N.svg: watercolor-painted facets of the TAISI mark, one per program.

Each is a facet polygon taken from the logo geometry, painted in two washes with a gold seam along one edge.
Run:  python tools/make_shards.py
"""
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "assets" / "shards"
OUT.mkdir(parents=True, exist_ok=True)

# Facets from the logo (viewBox 0 0 1000 988), and which edge gets the gold seam.
FACETS = {
    "f4": [(236.0, 0), (377.8, 0), (484.6, 233.7), (329.8, 88.2)],
    "f5": [(80.5, 143.1), (321.5, 98.0), (335.2, 432.0)],
    "f6": [(331.9, 104.2), (493.3, 255.9), (346.7, 461.6), (346.0, 445.9)],
    "f7": [(205.8, 406.7), (79.9, 157.8), (335.9, 448.2), (336.7, 468.5)],
    "f9": [(361.7, 714.7), (213.3, 421.5), (340.0, 481.3), (492.0, 553.0)],
    "f2": [(87.9, 131.3), (228.5, 6.9), (315.5, 88.7)],
    "f10": [(494.9, 977.9), (366.7, 724.7), (494.9, 565.7)],
    "f3": [(389.0, 0), (494.9, 0), (494.9, 231.8)],
}

# (file number, facet, main colour, second wash, seam edge index, rotation)
PLAN = [
    (1, "f4", "#501684", "#7B3FBA", 0, -8),
    (2, "f5", "#7B3FBA", "#C4A3E8", 1, 6),
    (3, "f6", "#C4A3E8", "#7B3FBA", 0, -4),
    (4, "f9", "#FF9F03", "#FFB21F", 2, 10),
    (5, "f7", "#6B2CA8", "#C4A3E8", 2, -12),
    (6, "f2", "#45106F", "#7B3FBA", 1, 14),
    (7, "f9", "#C2569B", "#F0B8D6", 1, -6),   # rose: Research, set apart from the purple shards
    (8, "f10", "#3A0E63", "#7B3FBA", 0, 8),   # deep purple: Technical reading group
]

S = 400       # output viewBox size
PAD = 44


def fit(poly):
    xs = [p[0] for p in poly]
    ys = [p[1] for p in poly]
    w, h = max(xs) - min(xs), max(ys) - min(ys)
    k = (S - 2 * PAD) / max(w, h)
    ox = (S - w * k) / 2 - min(xs) * k
    oy = (S - h * k) / 2 - min(ys) * k
    return [(x * k + ox, y * k + oy) for x, y in poly]


def pts(poly):
    return " ".join(f"{x:.1f},{y:.1f}" for x, y in poly)


FILTER = """
  <filter id="w{n}" x="-25%" y="-25%" width="150%" height="150%" color-interpolation-filters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency="0.022" numOctaves="4" seed="{s}" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="{disp}" xChannelSelector="R" yChannelSelector="G" result="d"/>
    <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="3" seed="{s2}" result="blot"/>
    <feColorMatrix in="blot" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 2.1 -0.5" result="blotA"/>
    <feComposite in="d" in2="blotA" operator="arithmetic" k1="0.65" k2="0.4" result="uneven"/>
    <feTurbulence type="fractalNoise" baseFrequency="0.42" numOctaves="2" seed="{s3}" result="g"/>
    <feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.9 1.3" result="gA"/>
    <feComposite in="uneven" in2="gA" operator="in" result="grain"/>
    <feGaussianBlur in="d" stdDeviation="4" result="b"/>
    <feComposite in="d" in2="b" operator="out" result="edge"/>
    <feMerge><feMergeNode in="grain"/><feMergeNode in="edge"/></feMerge>
  </filter>"""

SEAM = """
  <filter id="s{n}" x="-20%" y="-20%" width="140%" height="140%">
    <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="3" seed="{s}" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="6" xChannelSelector="R" yChannelSelector="G"/>
  </filter>"""

for n, facet, c1, c2, edge, rot in PLAN:
    poly = fit(FACETS[facet])
    # the second wash: same facet, nudged and slightly smaller, so the pigment overlaps like a glaze
    cx = sum(p[0] for p in poly) / len(poly)
    cy = sum(p[1] for p in poly) / len(poly)
    glaze = [(cx + (x - cx) * 0.86 + 10, cy + (y - cy) * 0.86 + 8) for x, y in poly]
    a, b = poly[edge], poly[(edge + 1) % len(poly)]
    seam_col = "#FF9F03" if c1 != "#FF9F03" else "#7B3FBA"
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {S} {S}" aria-hidden="true">
<defs>{FILTER.format(n=1, s=n * 7, s2=n * 7 + 3, s3=n * 7 + 5, disp=14)}{FILTER.format(n=2, s=n * 11, s2=n * 11 + 3, s3=n * 11 + 5, disp=18)}{SEAM.format(n=1, s=n * 13)}</defs>
<g transform="rotate({rot} {S / 2} {S / 2})">
  <g filter="url(#w1)"><polygon points="{pts(poly)}" fill="{c1}" fill-opacity="0.62"/></g>
  <g filter="url(#w2)" style="mix-blend-mode:multiply"><polygon points="{pts(glaze)}" fill="{c2}" fill-opacity="0.38"/></g>
  <g filter="url(#s1)"><line x1="{a[0]:.1f}" y1="{a[1]:.1f}" x2="{b[0]:.1f}" y2="{b[1]:.1f}" stroke="{seam_col}" stroke-width="7" stroke-linecap="round" stroke-opacity="0.85"/></g>
</g>
</svg>
"""
    (OUT / f"shard-{n}.svg").write_text(svg, encoding="utf-8")
print(f"wrote {len(PLAN)} shards to {OUT}")
