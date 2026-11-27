"""Draw the TAISI mark (purple triangle, gold facet lines) as favicon PNGs and favicon.ico.

Same geometry as favicon.svg and the header mark. Pure Python (no Pillow): each pixel is supersampled.
Run:  python tools/make_favicon.py
"""
import struct, zlib
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PURPLE, GOLD, PAPER = (0x50, 0x16, 0x84), (0xFF, 0x9F, 0x03), (0xFA, 0xF8, 0xF5)
TRI = [(0, 0), (1000, 0), (500, 988)]
LINES = [((228.6, 0), (52.7, 155.6)), ((228.6, 0), (326.3, 91.9)), ((326.3, 91.9), (500, 255.2)),
         ((326.3, 91.9), (47.1, 144.1)), ((326.3, 91.9), (340.9, 446.1)), ((70.7, 139.7), (340.9, 446.1)),
         ((500, 255.2), (373.4, -21.8)), ((500, 255.2), (342.2, 476.7)), ((500, -24), (500, 1012)),
         ((342.2, 476.7), (187.9, 403.9)), ((500, 551.2), (349.2, 738.4))]
VIEW = (-20, -26, 1040)  # x, y, size: same square viewBox as favicon.svg


def inside(px, py):
    (x1, y1), (x2, y2), (x3, y3) = TRI
    d = lambda ax, ay, bx, by: (px - bx) * (ay - by) - (ax - bx) * (py - by)
    a, b, c = d(x1, y1, x2, y2), d(x2, y2, x3, y3), d(x3, y3, x1, y1)
    return not ((a < 0 or b < 0 or c < 0) and (a > 0 or b > 0 or c > 0))


def near_line(px, py, half):
    for (ax, ay), (bx, by) in LINES:
        vx, vy = bx - ax, by - ay
        t = max(0, min(1, ((px - ax) * vx + (py - ay) * vy) / (vx * vx + vy * vy)))
        if (px - ax - t * vx) ** 2 + (py - ay - t * vy) ** 2 <= half * half:
            return True
    return False


def render(n, pad=0.0, bg=None, ss=6):
    vx, vy, vs = VIEW
    inner = n * (1 - 2 * pad)
    half = 13 if inner >= 64 else 13 * max(1.0, 40 / inner)   # the header's 26-unit stroke; thicker when tiny so it stays visible
    rows = []
    for j in range(n):
        row = bytearray([0])
        for i in range(n):
            acc = [0.0, 0.0, 0.0, 0.0]
            for sj in range(ss):
                for si in range(ss):
                    x = ((i + (si + .5) / ss) - n * pad) / inner * vs + vx
                    y = ((j + (sj + .5) / ss) - n * pad) / inner * vs + vy
                    if inside(x, y):
                        c = GOLD if near_line(x, y, half) else PURPLE
                        acc[0] += c[0]; acc[1] += c[1]; acc[2] += c[2]; acc[3] += 1
            k = ss * ss
            cov = acc[3] / k
            if bg:
                r, g, b = (round(acc[q] / k + bg[q] * (1 - cov)) for q in range(3))
                row += bytes([r, g, b, 255])
            elif cov:
                row += bytes([round(acc[0] / acc[3]), round(acc[1] / acc[3]), round(acc[2] / acc[3]), round(cov * 255)])
            else:
                row += bytes(4)
        rows.append(bytes(row))
    chunk = lambda t, d: struct.pack(">I", len(d)) + t + d + struct.pack(">I", zlib.crc32(t + d) & 0xffffffff)
    return (b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack(">IIBBBBB", n, n, 8, 6, 0, 0, 0))
            + chunk(b"IDAT", zlib.compress(b"".join(rows), 9)) + chunk(b"IEND", b""))


pngs = {n: render(n) for n in (16, 32, 48)}
ico = struct.pack("<HHH", 0, 1, len(pngs))
off = 6 + 16 * len(pngs)
for n, data in pngs.items():
    ico += struct.pack("<BBBBHHII", n, n, 0, 0, 1, 32, len(data), off); off += len(data)
ico += b"".join(pngs.values())
(ROOT / "favicon.ico").write_bytes(ico)
(ROOT / "images" / "icon.png").write_bytes(render(192, ss=3))
(ROOT / "apple-touch-icon.png").write_bytes(render(180, pad=0.14, bg=PAPER, ss=3))
print("wrote favicon.ico (16/32/48), images/icon.png (192), apple-touch-icon.png (180)")
