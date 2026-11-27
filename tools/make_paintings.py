"""Generate the watercolor TAISI mark (assets/mark-watercolor.svg) and the paper texture (assets/paper.svg).

The mark uses the real facet geometry from the logo; each facet is a separate wash, and the gold seams are painted
on top with a slightly wobbly brush.  Run:  python tools/make_paintings.py
"""
from pathlib import Path

ASSETS = Path(__file__).resolve().parent.parent / "assets"

FACETS = [
    ("505.1,0 1000,0 505.1,977.9", "#501684", 0.66),
    ("0,0 220.9,0 68.3,135.0", "#9B6BD0", 0.6),
    ("87.9,131.3 228.5,6.9 315.5,88.7", "#501684", 0.6),
    ("389.0,0 494.9,0 494.9,231.8", "#B48BE0", 0.62),
    ("236.0,0 377.8,0 484.6,233.7 329.8,88.2", "#5E2197", 0.62),
    ("80.5,143.1 321.5,98.0 335.2,432.0", "#8A55C6", 0.6),
    ("331.9,104.2 493.3,255.9 346.7,461.6 346.0,445.9", "#45106F", 0.6),
    ("205.8,406.7 79.9,157.8 335.9,448.2 336.7,468.5", "#501684", 0.58),
    ("494.9,271.1 494.9,543.2 349.9,474.7", "#9B6BD0", 0.62),
    ("361.7,714.7 213.3,421.5 340.0,481.3 492.0,553.0", "#3B0B60", 0.6),
    ("494.9,977.9 366.7,724.7 494.9,565.7", "#45106F", 0.62),
]
SEAMS = ("M228.6 0L52.7 155.6M228.6 0L326.3 91.9M326.3 91.9L500 255.2M326.3 91.9L47.1 144.1M326.3 91.9L340.9 446.1"
         "M70.7 139.7L340.9 446.1M500 255.2L373.4 -21.8M500 255.2L342.2 476.7M500 255.2L500 -24M500 255.2L500 551.2"
         "M340.9 446.1L342.2 476.7M342.2 476.7L187.9 403.9M342.2 476.7L500 551.2M500 551.2L349.2 738.4M500 551.2L500 1012")

WASH = """
  <filter id="f{i}" x="-15%" y="-15%" width="130%" height="130%" color-interpolation-filters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="4" seed="{s}" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="16" xChannelSelector="R" yChannelSelector="G" result="d"/>
    <feTurbulence type="fractalNoise" baseFrequency="0.006" numOctaves="2" seed="{s2}" result="blot"/>
    <feColorMatrix in="blot" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 2.2 -0.5" result="blotA"/>
    <feComposite in="d" in2="blotA" operator="arithmetic" k1="0.32" k2="0.72" result="uneven"/>
    <feTurbulence type="fractalNoise" baseFrequency="0.38" numOctaves="2" seed="{s3}" result="g"/>
    <feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.9 1.3" result="gA"/>
    <feComposite in="uneven" in2="gA" operator="in" result="grain"/>
    <feGaussianBlur in="d" stdDeviation="5" result="b"/>
    <feComposite in="d" in2="b" operator="out" result="edge"/>
    <feMerge><feMergeNode in="grain"/><feMergeNode in="edge"/></feMerge>
  </filter>"""

defs = "".join(WASH.format(i=i, s=i * 7 + 2, s2=i * 7 + 4, s3=i * 7 + 6) for i in range(len(FACETS)))
washes = "".join(
    f'<g filter="url(#f{i})" style="mix-blend-mode:multiply"><polygon points="{pts}" fill="{c}" fill-opacity="{o}"/></g>'
    for i, (pts, c, o) in enumerate(FACETS))

mark = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="-70 -70 1140 1130" role="img" aria-label="TAISI logo, painted in watercolor">
<defs>{defs}
  <filter id="brush" x="-10%" y="-10%" width="120%" height="120%">
    <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="3" seed="44" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="9" xChannelSelector="R" yChannelSelector="G" result="d"/>
    <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="2" seed="45" result="g"/>
    <feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.7 1.4" result="gA"/>
    <feComposite in="d" in2="gA" operator="in"/>
  </filter>
  <clipPath id="tri"><path d="M0 0H1000L500 988Z"/></clipPath>
</defs>
{washes}
<g filter="url(#brush)" clip-path="url(#tri)"><path d="{SEAMS}" fill="none" stroke="#FF9F03" stroke-width="9" stroke-linecap="round" stroke-opacity="0.82"/></g>
</svg>
"""
(ASSETS / "mark-watercolor.svg").write_text(mark, encoding="utf-8")

paper = """<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320">
<filter id="p" x="0" y="0" width="100%" height="100%">
  <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" seed="3" stitchTiles="stitch" result="n"/>
  <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.35  0 0 0 0 0.25  0 0 0 0 0.4  0 0 0 -1.2 0.95"/>
</filter>
<rect width="320" height="320" filter="url(#p)" opacity="0.10"/>
</svg>
"""
(ASSETS / "paper.svg").write_text(paper, encoding="utf-8")

# ---- soft washes: blooms with darker pooled edges, for section bands and tiles ----
BLOOM = """
  <filter id="b{i}" x="-40%" y="-40%" width="180%" height="180%" color-interpolation-filters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency="{freq}" numOctaves="4" seed="{s}" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="{disp}" xChannelSelector="R" yChannelSelector="G" result="d"/>
    <feGaussianBlur in="d" stdDeviation="{soft}" result="soft"/>
    <feGaussianBlur in="d" stdDeviation="{rim}" result="b"/>
    <feComposite in="soft" in2="b" operator="out" result="rimA"/>
    <feComponentTransfer in="rimA" result="rim"><feFuncA type="linear" slope="0.8"/></feComponentTransfer>
    <feTurbulence type="fractalNoise" baseFrequency="0.4" numOctaves="2" seed="{s3}" result="g"/>
    <feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.8 1.3" result="gA"/>
    <feComposite in="soft" in2="gA" operator="in" result="grain"/>
    <feMerge><feMergeNode in="grain"/><feMergeNode in="rim"/></feMerge>
  </filter>"""


def bloom_svg(w, h, shapes, name, freq="0.006", disp=110, soft=6, rim=16):
    defs = BLOOM.format(i=0, freq=freq, s=len(name) * 13 + 3, s3=len(name) * 7 + 1, disp=disp, soft=soft, rim=rim)
    body = "".join(
        f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="{c}" fill-opacity="{o}"/>' for cx, cy, rx, ry, c, o in shapes)
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">'
           f"<defs>{defs}</defs><g filter=\"url(#b0)\" style=\"mix-blend-mode:multiply\">{body}</g></svg>\n")
    (ASSETS / name).write_text(svg, encoding="utf-8")


LILAC, GOLD, ROSE, SHARD = "#C4A3E8", "#FF9F03", "#D9A0C8", "#7B3FBA"
# a wide band: lilac bloom left, a warm glow right, room for text in the middle
bloom_svg(2400, 760, [
    (380, 400, 560, 230, LILAC, 0.2), (720, 500, 340, 130, ROSE, 0.1),
    (2020, 380, 520, 220, GOLD, 0.1), (1720, 520, 320, 120, LILAC, 0.12),
], "wash-band.svg", disp=150, soft=26, rim=44)
# tile washes, one per hue: a large bloom in one corner
for name, main, second in [("wash-lilac.svg", LILAC, SHARD), ("wash-gold.svg", GOLD, ROSE),
                           ("wash-rose.svg", ROSE, LILAC), ("wash-plum.svg", SHARD, LILAC)]:
    bloom_svg(800, 600, [(560, 420, 300, 230, main, 0.42), (380, 520, 220, 120, second, 0.22)], name,
              freq="0.012", disp=70, soft=5, rim=12)
# a backing wash for photos
bloom_svg(900, 700, [(440, 360, 380, 280, LILAC, 0.24), (640, 480, 220, 150, GOLD, 0.12)], "wash-photo.svg",
          freq="0.01", disp=90, soft=16, rim=30)
print("wrote mark-watercolor.svg, paper.svg and washes")

# ---- portraits: deckled watercolor edges (used as CSS masks) and a wash that peeks out behind ----
MASK = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" preserveAspectRatio="none">
<filter id="m" x="-15%" y="-15%" width="130%" height="130%">
  <feTurbulence type="fractalNoise" baseFrequency="{freq}" numOctaves="4" seed="{seed}" result="n"/>
  <feDisplacementMap in="SourceGraphic" in2="n" scale="{disp}" xChannelSelector="R" yChannelSelector="G" result="d"/>
  <feGaussianBlur in="d" stdDeviation="0.7"/>
</filter>
<g filter="url(#m)">{shape}</g>
</svg>
"""
for i, seed in enumerate((4, 17, 29), start=1):
    (ASSETS / f"mask-portrait-{i}.svg").write_text(MASK.format(
        freq="0.03", seed=seed, disp=13, shape='<rect x="9" y="9" width="182" height="182" rx="20" fill="#fff"/>'), encoding="utf-8")
(ASSETS / "mask-round.svg").write_text(MASK.format(
    freq="0.04", seed=8, disp=12, shape='<circle cx="100" cy="100" r="90" fill="#fff"/>'), encoding="utf-8")

for name, main, second in [("wash-portrait-lilac.svg", LILAC, SHARD), ("wash-portrait-rose.svg", ROSE, LILAC),
                           ("wash-portrait-gold.svg", GOLD, ROSE)]:
    bloom_svg(400, 400, [(205, 210, 165, 160, main, 0.42), (250, 260, 90, 70, second, 0.2)], name,
              freq="0.016", disp=50, soft=4, rim=10)
print("wrote portrait masks and washes")

# ---- brushstrokes: a single loose stroke to sit behind a word ----
for name, main, second in [("brush-lilac.svg", LILAC, SHARD), ("brush-gold.svg", GOLD, ROSE), ("brush-rose.svg", ROSE, LILAC)]:
    bloom_svg(600, 160, [(300, 84, 270, 44, main, 0.5), (360, 96, 150, 22, second, 0.18)], name,
              freq="0.02 0.06", disp=34, soft=2.5, rim=7)
print("wrote brushstrokes")
