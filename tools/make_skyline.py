"""Generate assets/skyline.svg: a watercolor Toronto skyline in TAISI colours.

Vector, so it stays sharp at any width. Run:  python tools/make_skyline.py
Change SEED or the landmark list below and re-run to repaint.
"""
import math
import random
from pathlib import Path

W, H = 2400, 640
BASE = 548          # waterline
SEED = 11
random.seed(SEED)

PURPLE = "#501684"
SHARD_L = "#7B3FBA"
SHARD_M = "#6B2CA8"
LILAC = "#C4A3E8"
GOLD = "#FF9F03"
ROSE = "#D9A0C8"    # a warm lilac, mixes purple toward the gold glow


# ---- shapes -------------------------------------------------------------
def rect(x, w, h, base=BASE):
    return f"M{x:.1f} {base}V{base - h:.1f}H{x + w:.1f}V{base}Z"


def stepped(x, w, h, base=BASE):
    top = base - h
    i = w * 0.14
    return (f"M{x:.1f} {base}V{top:.1f}H{x + i:.1f}V{top - h * 0.05:.1f}"
            f"H{x + w - i:.1f}V{top:.1f}H{x + w:.1f}V{base}Z")


def slanted(x, w, h, base=BASE):
    top = base - h
    return f"M{x:.1f} {base}V{top + w * 0.35:.1f}L{x + w:.1f} {top:.1f}V{base}Z"


def spire(x, w, h, base=BASE):
    top = base - h
    return rect(x, w, h, base) + f"M{x + w / 2 - 1.6:.1f} {top + 1:.1f}V{top - h * 0.16:.1f}h3.2V{top + 1:.1f}Z"


def cn_tower(cx, base=BASE):
    s = 1.05
    shaft_top = base - 300 * s
    d = f"M{cx - 30} {base}L{cx - 8.5} {shaft_top:.1f}H{cx + 8.5}L{cx + 30} {base}Z"
    py = base - 318 * s
    d += (f"M{cx - 37} {py:.1f}C{cx - 41} {py - 14:.1f} {cx - 31} {py - 27:.1f} {cx - 20} {py - 29:.1f}"
          f"H{cx + 20}C{cx + 31} {py - 27:.1f} {cx + 41} {py - 14:.1f} {cx + 37} {py:.1f}"
          f"C{cx + 28} {py + 12:.1f} {cx - 28} {py + 12:.1f} {cx - 37} {py:.1f}Z")
    sy = base - 446 * s
    d += f"M{cx - 6} {py - 27:.1f}L{cx - 3.6} {sy:.1f}H{cx + 3.6}L{cx + 6} {py - 27:.1f}Z"
    d += f"M{cx - 12} {sy:.1f}Q{cx} {sy - 17:.1f} {cx + 12} {sy:.1f}Q{cx} {sy + 8:.1f} {cx - 12} {sy:.1f}Z"
    d += f"M{cx - 2.2} {sy - 9:.1f}L{cx - 0.9} {base - 535 * s:.1f}H{cx + 0.9}L{cx + 2.2} {sy - 9:.1f}Z"
    return d


def dome(x, w, h, base=BASE):
    return f"M{x} {base}V{base - h * 0.32}Q{x + w / 2} {base - h * 1.6} {x + w} {base - h * 0.32}V{base}Z"


def envelope(x):
    """Typical height (0-1) along the shoreline: low at the edges, a hump at the core."""
    core = math.exp(-((x - 1560) / 520) ** 2)
    west = 0.45 * math.exp(-((x - 420) / 300) ** 2)
    east = 0.55 * math.exp(-((x - 2080) / 260) ** 2)
    return 0.22 + 0.78 * max(core, west, east)


SHAPES = [rect, rect, rect, stepped, stepped, slanted, spire]


def row(x0, x1, hmax, wmin, wmax, gap, avoid=(), jitter=0.35):
    out = []
    x = x0
    while x < x1:
        w = random.uniform(wmin, wmax)
        if not any(a - w <= x <= b for a, b in avoid):
            h = hmax * envelope(x) * random.uniform(1 - jitter, 1 + jitter * 0.6)
            out.append(random.choice(SHAPES)(x, w, max(h, 12)))
        x += w + random.uniform(*gap)
    return out


def paint(paths, colours, op):
    """One <path> per building, each with its own pigment and strength."""
    s = []
    for d in paths:
        c = random.choice(colours)
        o = random.uniform(*op)
        s.append(f'<path d="{d}" fill="{c}" fill-opacity="{o:.2f}"/>')
    return "".join(s)


CN = 860
DOME = (930, 215, 72)
CORE = [  # financial district, west to east: x, width, height, shape
    (1250, 66, 290, rect), (1322, 56, 238, stepped), (1384, 84, 380, rect),
    (1475, 66, 336, stepped), (1548, 52, 262, slanted), (1606, 72, 300, spire),
    (1684, 46, 214, rect), (1736, 64, 348, stepped), (1806, 52, 236, rect),
]

far = row(-30, W + 30, 190, 26, 64, (-10, 4))
mid = row(40, W - 20, 230, 30, 62, (6, 30), avoid=((CN - 60, CN + 50), (DOME[0], DOME[0] + DOME[1]), (1240, 1870)))
mid_core = [f(x, w, h) for x, w, h, f in CORE]
landmarks = [cn_tower(CN), dome(*DOME)]
def treeline(x0, x1):
    """Toronto Islands tree line in the foreground: overlapping soft crowns on a low bank."""
    out = [f"M{x0} {BASE + 2}V{BASE - 6}H{x1}V{BASE + 2}Z"]
    x = x0
    while x < x1:
        r = random.uniform(7, 20)
        if random.random() < 0.18:          # gaps in the trees
            x += random.uniform(30, 120)
            continue
        cy = BASE - 4 - r * random.uniform(0.3, 0.9)
        out.append(f"M{x - r:.1f} {BASE - 3}A{r:.1f} {r * 1.1:.1f} 0 0 1 {x + r:.1f} {BASE - 3}Z" if random.random() < 0.5
                   else f"M{x - r:.1f} {BASE - 3}Q{x:.1f} {cy - r:.1f} {x + r:.1f} {BASE - 3}Z")
        x += r * random.uniform(0.9, 1.6)
    return out


near = treeline(-30, W + 30)

# ---- water -------------------------------------------------------------
streaks = []
for _ in range(60):
    y = random.uniform(BASE + 8, H - 10)
    depth = (y - BASE) / (H - BASE)
    w = random.uniform(30, 240) * (1 - depth * 0.5)
    x = random.uniform(0, W - w)
    col = random.choice([LILAC, LILAC, SHARD_L, GOLD, GOLD])
    op = random.uniform(0.15, 0.38) * (1 - depth * 0.6)
    streaks.append(f'<rect x="{x:.0f}" y="{y:.0f}" width="{w:.0f}" height="{random.uniform(2.5, 5.5):.1f}" rx="2.5" fill="{col}" fill-opacity="{op:.2f}"/>')
for x, w in [(CN - 9, 18), (1384, 84), (1475, 66), (1736, 64)]:   # reflections of the tallest shapes
    streaks.append(f'<rect x="{x}" y="{BASE + 4}" width="{w}" height="{random.uniform(40, 70):.0f}" fill="{SHARD_L}" fill-opacity="0.12"/>')

# ---- filters ------------------------------------------------------------
# Wet edge: displaced outline, uneven pigment (large-scale noise), paper grain, darker rim where pigment pools.
WASH = """
  <filter id="{id}" x="-4%" y="-30%" width="108%" height="160%" color-interpolation-filters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency="{edge}" numOctaves="4" seed="{s}" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="{disp}" xChannelSelector="R" yChannelSelector="G" result="d"/>
    <feTurbulence type="fractalNoise" baseFrequency="0.004 0.014" numOctaves="3" seed="{s2}" result="blot"/>
    <feColorMatrix in="blot" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 2.2 -0.55" result="blotA"/>
    <feComposite in="d" in2="blotA" operator="arithmetic" k1="0.6" k2="0.42" result="uneven"/>
    <feTurbulence type="fractalNoise" baseFrequency="0.38" numOctaves="2" seed="{s3}" result="g"/>
    <feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.9 1.3" result="gA"/>
    <feComposite in="uneven" in2="gA" operator="in" result="grain"/>
    <feGaussianBlur in="d" stdDeviation="{rim}" result="b"/>
    <feComposite in="d" in2="b" operator="out" result="edge"/>
    <feGaussianBlur in="grain" stdDeviation="0.6" result="soft"/>
    <feMerge><feMergeNode in="soft"/><feMergeNode in="edge"/></feMerge>
  </filter>"""


def wash(id_, edge, disp, seed, rim):
    return WASH.format(id=id_, edge=edge, disp=disp, s=seed, s2=seed + 20, s3=seed + 40, rim=rim)


svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" preserveAspectRatio="xMidYMax slice" role="img" aria-label="Watercolor painting of the Toronto skyline">
<defs>
  {wash("wFar", "0.02 0.045", 9, 3, 3)}
  {wash("wMid", "0.025 0.06", 7, 9, 2.6)}
  {wash("wNear", "0.03 0.07", 7, 14, 2.4)}
  {wash("wWater", "0.008 0.08", 10, 21, 2)}
  <filter id="bleed" x="-30%" y="-80%" width="160%" height="260%">
    <feTurbulence type="fractalNoise" baseFrequency="0.005 0.009" numOctaves="3" seed="2" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="120" xChannelSelector="R" yChannelSelector="B" result="d"/>
    <feGaussianBlur in="d" stdDeviation="22"/>
  </filter>
  <linearGradient id="fadeX" x1="0" x2="1">
    <stop offset="0" stop-color="#fff" stop-opacity="0"/>
    <stop offset="0.1" stop-color="#fff"/>
    <stop offset="0.9" stop-color="#fff"/>
    <stop offset="1" stop-color="#fff" stop-opacity="0"/>
  </linearGradient>
  <linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="{LILAC}" stop-opacity="0.42"/>
    <stop offset="0.5" stop-color="{LILAC}" stop-opacity="0.16"/>
    <stop offset="1" stop-color="{LILAC}" stop-opacity="0"/>
  </linearGradient>
  <mask id="m" maskUnits="userSpaceOnUse" x="0" y="0" width="{W}" height="{H}">
    <rect width="{W}" height="{H}" fill="url(#fadeX)"/>
  </mask>
</defs>
<g mask="url(#m)">
  <g filter="url(#bleed)">
    <ellipse cx="1500" cy="380" rx="700" ry="150" fill="{GOLD}" fill-opacity="0.16"/>
    <ellipse cx="1200" cy="420" rx="420" ry="90" fill="{ROSE}" fill-opacity="0.22"/>
    <ellipse cx="560" cy="430" rx="560" ry="120" fill="{LILAC}" fill-opacity="0.32"/>
    <ellipse cx="2080" cy="440" rx="440" ry="110" fill="{LILAC}" fill-opacity="0.28"/>
  </g>
  <g filter="url(#wFar)" style="mix-blend-mode:multiply">{paint(far, [LILAC, LILAC, ROSE], (0.32, 0.55))}</g>
  <g filter="url(#wMid)" style="mix-blend-mode:multiply">
    {paint(mid, [SHARD_L, SHARD_M, LILAC], (0.32, 0.5))}
    {paint(mid_core, [SHARD_L, SHARD_M, SHARD_L], (0.38, 0.55))}
    <path d="{landmarks[0]}" fill="{SHARD_M}" fill-opacity="0.58"/>
    <path d="{landmarks[1]}" fill="{SHARD_L}" fill-opacity="0.42"/>
  </g>
  <g filter="url(#wNear)" style="mix-blend-mode:multiply">{paint(near, [PURPLE, SHARD_M, SHARD_L], (0.28, 0.45))}</g>
  <g filter="url(#wWater)" style="mix-blend-mode:multiply">
    <rect x="0" y="{BASE - 3}" width="{W}" height="{H - BASE + 3}" fill="url(#water)"/>
    {''.join(streaks)}
  </g>
</g>
</svg>
"""

out = Path(__file__).resolve().parent.parent / "assets" / "skyline.svg"
out.write_text(svg, encoding="utf-8")
print(f"wrote {out} ({len(svg) // 1024} KB)")

# ---- hero: a full watercolor sky above the same skyline -----------------
HH = 1500
SKY_SCALE = 0.7      # the city sits in the lower middle of the painting, fading out at the sides
inner =svg[svg.index(">", svg.index("<svg")) + 1: svg.rindex("</svg>")]
random.seed(SEED + 1)
clouds = []
for _ in range(9):
    cx = random.uniform(100, W - 100)
    cy = random.uniform(820, 1150)
    rx = random.uniform(240, 620)
    ry = random.uniform(14, 34)
    col = random.choice([LILAC, LILAC, ROSE, SHARD_L])
    op = random.uniform(0.14, 0.28) if col != SHARD_L else 0.1
    clouds.append(f'<ellipse cx="{cx:.0f}" cy="{cy:.0f}" rx="{rx:.0f}" ry="{ry:.0f}" fill="{col}" fill-opacity="{op:.2f}"/>')

hero = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {HH}" preserveAspectRatio="xMidYMax slice" role="img" aria-label="Watercolor painting of Toronto at dawn">
<defs>
  <filter id="sky" x="-30%" y="-60%" width="160%" height="220%" color-interpolation-filters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency="0.0035 0.006" numOctaves="4" seed="5" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="190" xChannelSelector="R" yChannelSelector="G" result="d"/>
    <feGaussianBlur in="d" stdDeviation="9" result="soft"/>
    <feGaussianBlur in="d" stdDeviation="22" result="b"/>
    <feComposite in="soft" in2="b" operator="out" result="rim"/>
    <feTurbulence type="fractalNoise" baseFrequency="0.45" numOctaves="2" seed="31" result="g"/>
    <feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.8 1.3" result="gA"/>
    <feComposite in="soft" in2="gA" operator="in" result="grain"/>
    <feMerge><feMergeNode in="grain"/><feMergeNode in="rim"/></feMerge>
  </filter>
  <linearGradient id="heroWater" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="{LILAC}" stop-opacity="0.22"/>
    <stop offset="1" stop-color="{LILAC}" stop-opacity="0"/>
  </linearGradient>
  <filter id="streak" x="-10%" y="-200%" width="120%" height="500%">
    <feTurbulence type="fractalNoise" baseFrequency="0.01 0.08" numOctaves="3" seed="12" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="40" xChannelSelector="R" yChannelSelector="G" result="d"/>
    <feGaussianBlur in="d" stdDeviation="2.5"/>
  </filter>
</defs>
<g filter="url(#sky)" style="mix-blend-mode:multiply">
  <ellipse cx="1200" cy="-40" rx="1500" ry="200" fill="{LILAC}" fill-opacity="0.13"/>
  <ellipse cx="180" cy="260" rx="560" ry="260" fill="{LILAC}" fill-opacity="0.18"/>
  <ellipse cx="2260" cy="320" rx="520" ry="260" fill="{SHARD_L}" fill-opacity="0.08"/>
  <ellipse cx="1500" cy="1260" rx="900" ry="220" fill="{GOLD}" fill-opacity="0.13"/>
  <ellipse cx="860" cy="1240" rx="680" ry="170" fill="{ROSE}" fill-opacity="0.15"/>
  <ellipse cx="2150" cy="1250" rx="420" ry="140" fill="{LILAC}" fill-opacity="0.16"/>
</g>
<g filter="url(#streak)" style="mix-blend-mode:multiply" opacity="0.6">{''.join(clouds)}</g>
<rect x="0" y="{HH - 70}" width="{W}" height="70" fill="url(#heroWater)"/>
<g transform="translate({W * (1 - SKY_SCALE) / 2:.0f} {HH - H * SKY_SCALE:.0f}) scale({SKY_SCALE})">{inner}</g>
</svg>
"""
out = out.with_name("hero.svg")
out.write_text(hero, encoding="utf-8")
print(f"wrote {out} ({len(hero) // 1024} KB)")
