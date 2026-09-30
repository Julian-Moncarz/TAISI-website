// The TAISI geometric objects: every animated object from the "TAISI
// Geometric Objects" design file, ported from Claude Design as is. Each entry
// in LIB is a small 3D scene (meshes plus a timeline) that Scene projects to
// flat SVG polygons for a given time T in seconds. Nothing here touches the
// DOM or the clock; GeoObject.tsx owns playback.
//
// Kept as plain JS on purpose: it is generated geometry, and matching the
// design file line for line makes it easy to pull in later revisions.
const TAU = Math.PI * 2, HP = Math.PI / 2;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const ios = (x) => -(Math.cos(Math.PI * x) - 1) / 2;
const E = (x) => ios(clamp(x, 0, 1));
const W = (x) => ios(Math.pow(clamp(x, 0, 1), 1.6));
const oc = (x) => 1 - Math.pow(1 - clamp(x, 0, 1), 3);
const ramp = (T, a, b, e = ios) => e(clamp((T - a) / (b - a), 0, 1));
const lerp = (a, b, t) => a + (b - a) * t;
const deg = (d) => d * Math.PI / 180;
const RAMP = [[0.84, 0.1, 80], [0.66, 0.14, 15], [0.36, 0.15, -65]];
function col(t) {
  const s = clamp(t, 0, 1) * 2, i = Math.min(1, Math.floor(s)), k = s - i;
  const c = RAMP[i].map((v, j) => v + (RAMP[i + 1][j] - v) * k);
  return `oklch(${c[0].toFixed(3)} ${c[1].toFixed(3)} ${c[2].toFixed(1)})`;
}
const mm = (A, B) => A.map((r) => [0, 1, 2].map((j) => r[0] * B[0][j] + r[1] * B[1][j] + r[2] * B[2][j]));
const mv = (A, v) => A.map((r) => r[0] * v[0] + r[1] * v[1] + r[2] * v[2]);
const Rx = (a) => { const c = Math.cos(a), s = Math.sin(a); return [[1, 0, 0], [0, c, -s], [0, s, c]]; };
const Ry = (a) => { const c = Math.cos(a), s = Math.sin(a); return [[c, 0, s], [0, 1, 0], [-s, 0, c]]; };
const Rz = (a) => { const c = Math.cos(a), s = Math.sin(a); return [[c, -s, 0], [s, c, 0], [0, 0, 1]]; };
function Raxis(ax, a) {
  const l = Math.hypot(...ax), [x, y, z] = ax.map((v) => v / l), c = Math.cos(a), s = Math.sin(a), C = 1 - c;
  return [[c + x * x * C, x * y * C - z * s, x * z * C + y * s], [y * x * C + z * s, c + y * y * C, y * z * C - x * s], [z * x * C - y * s, z * y * C + x * s, c + z * z * C]];
}
const I3 = [[1, 0, 0], [0, 1, 0], [0, 0, 1]], Z3 = [0, 0, 0];
const add3 = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub3 = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const lerp3 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

// logo banding: gold on the left, aubergine on the right, 11 bands
const angT = (a) => { const r = ((a % TAU) + TAU) % TAU; return Math.round((r < Math.PI ? 1 - r / Math.PI : (r - Math.PI) / Math.PI) * 9) / 9; };
const linT = (t) => Math.min(9, Math.max(0, Math.floor(t * 10))) / 9;

function surf(pos, { cols = 66, rows = 1, rimVs = [1], colT = angT, nrm, flip, a0 = 0, a1 = TAU } = {}) {
  const faces = [], rims = [];
  for (let c = 0; c < cols; c++) {
    const aa = a0 + (a1 - a0) * c / cols, ab = a0 + (a1 - a0) * (c + 1) / cols, am = (aa + ab) / 2;
    const t = colT(am), cc = col(t);
    for (let r = 0; r < rows; r++) {
      const v0 = r / rows, v1 = (r + 1) / rows;
      const p00 = pos(aa, v0), p10 = pos(ab, v0), p11 = pos(ab, v1), p01 = pos(aa, v1);
      let n;
      if (nrm) n = nrm(am, (v0 + v1) / 2);
      else { const dA = add3(sub3(p10, p00), sub3(p11, p01)), dV = add3(sub3(p01, p00), sub3(p11, p10)); n = flip ? cross(dA, dV) : cross(dV, dA); }
      faces.push({ poly: [p00, p10, p11, p01], n, col: cc, t });
    }
    rimVs.forEach((v, i) => rims.push({ a: pos(aa, v), b: pos(ab, v), col: cc, t, loop: i }));
  }
  return { faces, rims };
}
function ring(n, R, y, rot = 0) {
  const out = [];
  for (let i = 0; i < n; i++) { const a = rot + i * TAU / n; out.push([R * Math.cos(a), y, R * Math.sin(a)]); }
  return out;
}
function walls({ bottom, top, apex, strips, rimTop, rimBottom }) {
  const faces = [], rt = [], rb = [], n = top.length;
  for (let i = 0; i < n; i++) {
    const i2 = (i + 1) % n, side = cross([0, 1, 0], sub3(top[i2], top[i]));
    for (let j = 0; j < strips; j++) {
      const f0 = j / strips, f1 = (j + 1) / strips;
      const t0 = lerp3(top[i], top[i2], f0), t1 = lerp3(top[i], top[i2], f1), mid = lerp3(t0, t1, 0.5);
      const tt = angT(Math.atan2(mid[2], mid[0])), cc = col(tt);
      const b0 = apex ? null : lerp3(bottom[i], bottom[i2], f0), b1 = apex ? null : lerp3(bottom[i], bottom[i2], f1);
      const tris = apex ? [[apex, t1, t0]] : [[b0, b1, t1], [b0, t1, t0]];
      for (const poly of tris) {
        let nn = cross(sub3(poly[1], poly[0]), sub3(poly[2], poly[0]));
        const cen = [(poly[0][0] + poly[1][0] + poly[2][0]) / 3, 0, (poly[0][2] + poly[1][2] + poly[2][2]) / 3];
        if (dot(nn, apex ? side : cen) < 0) nn = nn.map((v) => -v);
        faces.push({ poly, n: nn, col: cc, t: tt, u: (i * strips + j + 0.5) / (n * strips) });
      }
      if (rimTop) rt.push({ a: t0, b: t1, col: cc, loop: 0 });
      if (rimBottom) rb.push({ a: b0, b: b1, col: cc, loop: 1 });
    }
  }
  return { faces, rims: rt.concat(rb) };
}
// flat one-sided card in the local xy plane, front facing +z
function card(polys, outline, rimCol) {
  return {
    faces: polys.map((p) => ({ poly: p.pts.map((q) => [q[0], q[1], 0]), n: [0, 0, 1], col: p.col, t: p.t })),
    rims: outline.map((q, i) => { const r = outline[(i + 1) % outline.length]; return { a: [q[0], q[1], 0], b: [r[0], r[1], 0], col: rimCol, loop: 0 }; }),
  };
}
const revN = (k) => (a) => [Math.cos(a), -k, Math.sin(a)];
const horN = (a) => [Math.cos(a), 0, Math.sin(a)];
const LG_R = 50.83, LG_H = 106.9, EL0 = Math.asin(18 / LG_R);
const cyl = (r, h, y0 = 0, rimVs = [0, 1]) => surf((a, v) => [r * Math.cos(a), y0 + h * v, r * Math.sin(a)], { nrm: horN, rimVs });

// ---- shared motion ----
const logoEl = (T, d, elF) => HP + (elF - HP) * W((T - d * 0.26) / (d * 0.74));
const eo = (x) => { const u = clamp(x, 0, 1); return u * u * (3 - 2 * u) * 0.35 + (1 - Math.pow(1 - u, 2.4)) * 0.65; };
const stdEl = (T, d, elF) => HP + (elF - HP) * eo((T - d * 0.03) / (d * 0.82));
const spin = (T, d, dir = 1, turns = 1.5) => dir * TAU * turns * (1 - W(T / d));
const std = (T, d, elF, dir = 1, turns = 1.5, yaw = 0) => mm(Rx(stdEl(T, d, elF)), Ry(yaw + spin(T, d, dir, turns)));
const rimAt = (T, d) => 1 - ramp(T, d - 0.6, d + 0.3);

// ---- meshes ----
const M = {};
M.cone = surf((a, v) => [LG_R * v * Math.cos(a), LG_H * v, LG_R * v * Math.sin(a)], { nrm: revN(LG_R / LG_H) });
M.facet = walls({ top: ring(3, 62, 100, deg(90)), apex: [0, 0, 0], strips: 6, rimTop: true });
M.scallop = surf((a, v) => { const h = LG_H * (1 + 0.1 * Math.cos(7 * a) * Math.pow(Math.sin(a), 2)); return [LG_R * v * Math.cos(a), h * v, LG_R * v * Math.sin(a)]; }, { cols: 154, nrm: revN(LG_R / LG_H) });
M.tel = [64, 47, 30].map((r) => cyl(r, 34));
M.arm = [[74, 24], [56, 54], [38, 74]].map(([r, h]) => surf((a, v) => [r * Math.cos(a), -h / 2 + h * v, r * Math.sin(a)], { cols: 240, nrm: horN, rimVs: [0, 1] }));
M.coin = cyl(70, 26, -13);
M.bowl = surf((a, v) => { const th = v * HP; return [58 * Math.sin(th) * Math.cos(a), -58 * Math.cos(th), 58 * Math.sin(th) * Math.sin(a)]; }, { cols: 120, rows: 10, colT: (a) => Math.min(9, Math.floor((Math.cos(a) + 1) / 2 * 10)) / 9, nrm: (a, v) => { const th = v * HP; return [Math.sin(th) * Math.cos(a), -Math.cos(th), Math.sin(th) * Math.sin(a)]; } });
M.tube = cyl(46, 90);
M.ros = Array.from({ length: 7 }, (_, i) => surf((a, v) => [LG_R * v * Math.cos(a), LG_H * v, LG_R * v * Math.sin(a)], { nrm: revN(LG_R / LG_H), colT: (a) => Math.round(clamp(i / 6 + (angT(a) - 0.5) * 0.2, 0, 1) * 10) / 10 }));
M.stack = [0.1, 0.37, 0.63, 0.9].map((t) => surf((a, v) => [56 * Math.cos(a), 24 * v, 56 * Math.sin(a)], { cols: 72, nrm: horN, rimVs: [0, 1], colT: (a) => Math.sin(a) > 0 ? t : clamp(t + (t < 0.5 ? 0.3 : -0.3), 0, 1) }));
const ROS_R = LG_H * Math.tan(Math.PI / 6);
M.ros6 = Array.from({ length: 6 }, (_, i) => { const t = 0.1 + 0.8 * (1 + Math.cos(HP + i * Math.PI / 3)) / 2; return surf((a, v) => [ROS_R * v * Math.cos(a), LG_H * v, ROS_R * v * Math.sin(a)], { cols: 120, nrm: revN(ROS_R / LG_H), colT: (a) => Math.abs(Math.cos(a)) < 1 / 3 ? t - 0.08 : t }); });
M.crown = surf((a, v) => { const w = Math.abs(((a * 6 / TAU) % 1) * 2 - 1); return [50 * Math.cos(a), v * (62 + 26 * (1 - w)), 50 * Math.sin(a)]; }, { cols: 72, nrm: horN, rimVs: [0, 1] });
M.imp = Array.from({ length: 22 }, (_, p) => surf((a, v) => [46 * Math.cos(a), 90 * v, 46 * Math.sin(a)], { a0: p * TAU / 22, a1: (p + 1) * TAU / 22, cols: 3, rimVs: [0, 1], nrm: horN }));
M.weave = cyl(52, 20);
M.hex = walls({ bottom: ring(6, 56, 0, 0), top: ring(6, 56, 76, 0), strips: 3, rimTop: true, rimBottom: true });
M.pent = walls({ bottom: ring(5, 26, 0, deg(90)), top: ring(5, 60, 90, deg(90)), strips: 3, rimTop: true, rimBottom: true });
M.vase = surf((a, v) => { const r = 18 + 40 * v * v; return [r * Math.cos(a), 100 * v, r * Math.sin(a)]; }, { rows: 10, rimVs: [0, 1] });

M.fan = Array.from({ length: 11 }, (_, j) => {
  const dl = Math.PI / 22, pts = [];
  for (let k = 0; k <= 4; k++) { const a = -dl + 2 * dl * k / 4; pts.push([118 * Math.cos(a), 118 * Math.sin(a)]); }
  for (let k = 4; k >= 0; k--) { const a = -dl + 2 * dl * k / 4; pts.push([52 * Math.cos(a), 52 * Math.sin(a)]); }
  const c = col(j / 10); return card([{ pts, col: c }], pts, c);
});
M.mosaic = (() => {
  const se = Math.sin(EL0), ce = Math.cos(EL0), out = [];
  const rp = (a) => [LG_R * Math.cos(a), LG_H * ce - LG_R * Math.sin(a) * se - 50];
  for (let k = 0; k <= 10; k++) {
    const aHi = Math.min(Math.PI, Math.PI * (1 - (k - 0.5) / 10)), aLo = Math.max(0, Math.PI * (1 - (k + 0.5) / 10));
    const pts = [[0, -50]];
    for (let q = 0; q <= 4; q++) pts.push(rp(aHi + (aLo - aHi) * q / 4));
    const c = col(k / 10), mid = rp((aHi + aLo) / 2), ul = Math.hypot(mid[0], mid[1] + 50);
    const cen = [pts.reduce((s, p) => s + p[0], 0) / pts.length, pts.reduce((s, p) => s + p[1], 0) / pts.length];
    out.push({ mesh: card([{ pts, col: c }], pts, c), cen, u: [mid[0] / ul, (mid[1] + 50) / ul, 0] });
  }
  return out;
})();
M.bloom = (() => {
  const ap = 34 * Math.cos(Math.PI / 6), Lp = 92, out = [];
  for (let i = 0; i < 6; i++) {
    const phi = HP + i * Math.PI / 3, R0 = Rz(phi - HP), base = [[-17, 0], [-17 / 3, 0], [17 / 3, 0], [17, 0]], tip = [0, Lp], polys = [];
    for (let k = 0; k < 3; k++) {
      const tri = [tip, base[k], base[k + 1]], g = mv(R0, [(tri[0][0] + tri[1][0] + tri[2][0]) / 3, (tri[0][1] + tri[1][1] + tri[2][1]) / 3, 0]);
      polys.push({ pts: tri, col: col(linT((g[0] + ap * Math.cos(phi) + 121) / 242)) });
    }
    out.push({ mesh: card(polys, [base[0], base[3], tip], polys[1].col), phi, ap, f0: -(Math.PI - Math.acos(ap / Lp)) });
  }
  return out;
})();
M.triad = [[[0, 127], [-55, 31.75], [55, 31.75]], [[-55, 31.75], [-110, -63.5], [0, -63.5]], [[55, 31.75], [0, -63.5], [110, -63.5]]].map((tr) => {
  const [A, B, C] = tr, polys = [];
  for (let k = 0; k < 4; k++) {
    const p0 = [lerp(B[0], C[0], k / 4), lerp(B[1], C[1], k / 4)], p1 = [lerp(B[0], C[0], (k + 1) / 4), lerp(B[1], C[1], (k + 1) / 4)];
    polys.push({ pts: [A, p0, p1], col: col(linT(((A[0] + p0[0] + p1[0]) / 3 + 110) / 220)) });
  }
  return { mesh: card(polys, tr, polys[1].col), cen: [(A[0] + B[0] + C[0]) / 3, (A[1] + B[1] + C[1]) / 3] };
});
M.turb = Array.from({ length: 8 }, (_, i) => {
  const pts = [[26, 0], [116, 0], [110 * Math.cos(0.18), 110 * Math.sin(0.18)], [96 * Math.cos(0.34), 96 * Math.sin(0.34)], [70 * Math.cos(0.42), 70 * Math.sin(0.42)], [44 * Math.cos(0.4), 44 * Math.sin(0.4)], [28 * Math.cos(0.3), 28 * Math.sin(0.3)]];
  const c = col(i / 7); return card([{ pts, col: c }], pts, c);
});
M.blinds = Array.from({ length: 11 }, (_, j) => {
  const y = (5 - j) * 18, pts = [[-100, y - 8], [100, y - 8], [100, y + 8], [-100, y + 8]], c = col(j / 10);
  return { mesh: card([{ pts, col: c }], pts, c), y };
});

function unrollMesh(m) {
  const Rc = 32, k = (1 - m) / Rc;
  return surf((a, v) => {
    const s = (a / TAU - 0.5) * TAU * Rc, th = s * k;
    return k > 1e-6 ? [Math.sin(th) / k, 196 * v, Rc + (Math.cos(th) - 1) / k] : [s, 196 * v, Rc];
  }, { rimVs: [0, 1], colT: (a) => linT(a / TAU), flip: true });
}
function unfurlMesh(m) {
  const L = Math.hypot(LG_R, LG_H), k0 = LG_R / L, k = k0 + (1 - k0) * m, cb = Math.sqrt(Math.max(0, 1 - k * k));
  return surf((a, v) => {
    const al = (a / TAU - 0.5) * TAU * k0 / k, rho = v * L;
    return [rho * k * Math.sin(al), rho * cb, rho * k * Math.cos(al)];
  }, { colT: (a) => linT(a / TAU), flip: true });
}
const lerp2 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
M.iris = Array.from({ length: 6 }, (_, i) => {
  const Rh = 110, a0 = HP + i * TAU / 6, a1 = a0 + TAU / 6, V0 = [Rh * Math.cos(a0), Rh * Math.sin(a0)], V1 = [Rh * Math.cos(a1), Rh * Math.sin(a1)], polys = [];
  for (let k = 0; k < 3; k++) { const p0 = lerp2(V0, V1, k / 3), p1 = lerp2(V0, V1, (k + 1) / 3); polys.push({ pts: [[0, 0], p0, p1], col: col(linT(((p0[0] + p1[0]) / 3 + 80) / 160)) }); }
  return { mesh: card(polys, [[0, 0], V0, V1], polys[1].col), V: V0 };
});
M.deal = [[-51, 51], [51, 51], [-51, -51], [51, -51]].map(([cx, cy]) => {
  const polys = [];
  for (let k = 0; k < 3; k++) { const x0 = cx - 48 + k * 32, x1 = x0 + 32; polys.push({ pts: [[x0, cy - 48], [x1, cy - 48], [x1, cy + 48], [x0, cy + 48]], col: col(linT(((x0 + x1) / 2 + 99) / 198)) }); }
  return { mesh: card(polys, [[cx - 48, cy - 48], [cx + 48, cy - 48], [cx + 48, cy + 48], [cx - 48, cy + 48]], polys[1].col), cx, cy };
});
const TV = (k) => { const a = HP + k * TAU / 6; return [105 * Math.cos(a), 105 * Math.sin(a)]; };
M.tum = Array.from({ length: 6 }, (_, k) => {
  const A = TV(k), B = TV(k + 1), c = col(k / 5), tri = [[0, 0], A, B];
  return { mesh: card([{ pts: tri, col: c }], tri, c), cen: [(A[0] + B[0]) / 3, (A[1] + B[1]) / 3], B };
});
M.tiles = [];
for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
  const cx = (c - 1.5) * 50, cy = (1.5 - r) * 50, pts = [[cx - 23, cy - 23], [cx + 23, cy - 23], [cx + 23, cy + 23], [cx - 23, cy + 23]], cc = col((c + r) / 6);
  M.tiles.push({ mesh: card([{ pts, col: cc }], pts, cc), cx, cy, delay: Math.hypot(c - 1.5, r - 1.5) / 2.13 * 0.34 + ((Math.atan2(r - 1.5, c - 1.5) + Math.PI) / TAU) * 0.1 });
}
// uneven shards of the logo cone
const LG_T0 = Math.asin(0.18), LOGO_T = (a) => { const m = Math.acos(Math.cos(a)); return clamp(Math.floor((Math.PI - LG_T0 - m) / (Math.PI - 2 * LG_T0) * 10), 0, 9) / 9; };
M.logoCone = surf((a, v) => [LG_R * v * Math.cos(a), LG_H * v, LG_R * v * Math.sin(a)], { cols: 120, nrm: revN(LG_R / LG_H), colT: LOGO_T });
const conePos = (a, v) => [LG_R * v * Math.cos(a), LG_H * v, LG_R * v * Math.sin(a)];
M.shards = (() => {
  const cuts = [0, 0.9, 1.75, 2.35, 3.45, 4.15, 5.25, TAU], vs = [0.42, 0.66, 0.5, 0.36, 0.62, 0.47, 0.7], out = [];
  for (let i = 0; i < 7; i++) for (const [v0, v1] of [[0, vs[i]], [vs[i], 1]]) {
    const a0 = cuts[i], a1 = cuts[i + 1], cols = Math.max(2, Math.round((a1 - a0) / TAU * 66));
    const m = surf((a, v) => conePos(a, v0 + (v1 - v0) * v), { a0, a1, cols: cols * 2, nrm: revN(LG_R / LG_H), rimVs: v0 > 0 ? [0, 1] : [1], colT: LOGO_T });
    const c0 = m.faces[0].col, c1 = m.faces[m.faces.length - 1].col;
    for (let q = 0; q < 4; q++) { const va = v0 + (v1 - v0) * q / 4, vb = v0 + (v1 - v0) * (q + 1) / 4; m.rims.push({ a: conePos(a0, va), b: conePos(a0, vb), col: c0, loop: 5 }, { a: conePos(a1, va), b: conePos(a1, vb), col: c1, loop: 6 }); }
    const am = (a0 + a1) / 2, vm = (v0 + v1) / 2, cen = conePos(am, vm);
    out.push({ mesh: m, cen, dir: [Math.cos(am), (vm - 0.5) * 1.4, Math.sin(am)], k: out.length });
  }
  return out;
})();
// cylinder cracked into two uneven halves along zigzag seams
M.crack = (() => {
  const zf = [0, 1, -0.6, 0.8, -1, 0.4, 0], zb = [0, -0.7, 0.9, -0.4, 0.6, -0.9, 0];
  const pw = (z, v) => { const x = clamp(v, 0, 1) * 6, i = Math.min(5, Math.floor(x)); return lerp(z[i], z[i + 1], x - i); };
  const fr = (v) => HP + 0.22 * pw(zf, v), bk = (v) => 3 * HP + 0.3 * pw(zb, v);
  const P3 = (a, v) => [48 * Math.cos(a), 100 * v, 48 * Math.sin(a)];
  return [[fr, bk], [bk, (v) => fr(v) + TAU]].map(([lo, hi], side) => {
    const map = (a, v) => lo(v) + (hi(v) - lo(v)) * a / TAU;
    const m = surf((a, v) => P3(map(a, v), v), { cols: 36, rows: 12, rimVs: [0, 1], colT: (a) => angT(map(a, 0.5)), nrm: (a, v) => horN(map(a, v)) });
    for (let q = 0; q < 24; q++) { const va = q / 24, vb = (q + 1) / 24; m.rims.push({ a: P3(lo(va), va), b: P3(lo(vb), vb), col: col(0.5), loop: 5 }, { a: P3(hi(va), va), b: P3(hi(vb), vb), col: col(0.5), loop: 6 }); }
    return m;
  });
})();
// rectangle of four uneven strips that restack as a bar chart
M.chart = (() => { let x = -100; return [26, 42, 58, 74].map((w, i) => { const pts = [[x, -22], [x + w, -22], [x + w, 22], [x, 22]], c = col(i / 3), cen = [x + w / 2, 0]; x += w; return { mesh: card([{ pts, col: c }], pts, c), cen, target: [-75 + i * 50, -50 + w / 2], rot: (i % 2 ? -1 : 1) * HP }; }); })();
// Dudeney's hinged dissection: equilateral triangle to square
M.diss = (() => {
  const U = 105, A = [0, 0], C = [2, 0], B = [1, Math.sqrt(3)], D = [0.5, Math.sqrt(3) / 2], Ev = [1.5, Math.sqrt(3) / 2], q = Math.sqrt(Math.sqrt(3));
  const jx = 1.5 - Math.sqrt(q * q - 0.75), J = [jx, 0], K = [jx + 1, 0], u = [(J[0] - Ev[0]) / q, (J[1] - Ev[1]) / q];
  const foot = (P) => { const t = (P[0] - Ev[0]) * u[0] + (P[1] - Ev[1]) * u[1]; return [Ev[0] + u[0] * t, Ev[1] + u[1] * t]; };
  const Lp = foot(D), Mp = foot(K), sc = (P) => [P[0] * U, P[1] * U];
  const pieces = [[A, J, Lp, D], [D, Lp, Mp, Ev, B], [Ev, Mp, K, C], [J, K, Mp, Lp]].map((poly, i) => { const pts = poly.map(sc), c = col([0, 0.34, 1, 0.67][i]); return card([{ pts, col: c }], pts, c); });
  const Mr = [2 * Ev[0] - 2 * K[0] + Mp[0], 2 * Ev[1] - 2 * K[1] + Mp[1]];
  return { pieces, D: sc(D), E: sc(Ev), K: sc(K), c0: sc([1, Math.sqrt(3) / 3]), c1: sc([(Lp[0] + Mr[0]) / 2, (Lp[1] + Mr[1]) / 2]), align: Math.atan2(2 * Ev[1] - Mp[1] - Lp[1], 2 * Ev[0] - Mp[0] - Lp[0]) };
})();
function litCol(t, n, k) {
  const l = Math.hypot(n[0], n[1], n[2]) || 1, nx = n[0] / l, ny = n[1] / l, nz = n[2] / l;
  const s2 = clamp(t, 0, 1) * 2, i = Math.min(1, Math.floor(s2)), q = s2 - i, c = RAMP[i].map((v, j) => v + (RAMP[i + 1][j] - v) * q);
  const L = clamp(c[0] + k * (0.09 * ny - 0.06 * nx - 0.05 * (1 - nz)), 0.2, 0.97);
  return `oklch(${L.toFixed(3)} ${c[1].toFixed(3)} ${c[2].toFixed(1)})`;
}
function boxM(hx, hy, hz, tone) {
  const V = (a, b, c2) => [a * hx, b * hy, c2 * hz], cc = col(tone);
  const faces = [[[1, -1, -1], [1, 1, -1], [1, 1, 1], [1, -1, 1], [1, 0, 0]], [[-1, -1, -1], [-1, -1, 1], [-1, 1, 1], [-1, 1, -1], [-1, 0, 0]], [[-1, 1, -1], [-1, 1, 1], [1, 1, 1], [1, 1, -1], [0, 1, 0]], [[-1, -1, -1], [1, -1, -1], [1, -1, 1], [-1, -1, 1], [0, -1, 0]], [[-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1], [0, 0, 1]], [[-1, -1, -1], [-1, 1, -1], [1, 1, -1], [1, -1, -1], [0, 0, -1]]]
    .map((f) => ({ poly: f.slice(0, 4).map((q) => V(...q)), n: f[4], col: cc, tone }));
  const rims = [], cs = [];
  for (const a of [-1, 1]) for (const b of [-1, 1]) for (const c2 of [-1, 1]) cs.push([a, b, c2]);
  cs.forEach((u, i) => cs.forEach((w, j) => { if (j > i && Math.abs(u[0] - w[0]) + Math.abs(u[1] - w[1]) + Math.abs(u[2] - w[2]) === 2) rims.push({ a: V(...u), b: V(...w), col: cc, loop: rims.length }); }));
  return { faces, rims };
}
function sphereM(r, tone, cols = 28, rows = 12) {
  const faces = [], P3 = (th, ph) => [r * Math.sin(th) * Math.cos(ph), r * Math.cos(th), r * Math.sin(th) * Math.sin(ph)], cc = col(tone);
  for (let a = 0; a < cols; a++) for (let b = 0; b < rows; b++) {
    const p0 = TAU * a / cols, p1 = TAU * (a + 1) / cols, t0 = Math.PI * b / rows, t1 = Math.PI * (b + 1) / rows;
    faces.push({ poly: [P3(t0, p0), P3(t0, p1), P3(t1, p1), P3(t1, p0)], n: P3((t0 + t1) / 2, (p0 + p1) / 2), col: cc, tone });
  }
  return { faces, rims: [] };
}
function extrude(pts, dz, tone) {
  const cc = col(tone), h = dz / 2, n = pts.length, cx = pts.reduce((a, q) => a + q[0], 0) / n, cy = pts.reduce((a, q) => a + q[1], 0) / n;
  const faces = [{ poly: pts.map((q) => [q[0], q[1], h]), n: [0, 0, 1], col: cc, tone }, { poly: pts.slice().reverse().map((q) => [q[0], q[1], -h]), n: [0, 0, -1], col: cc, tone }], rims = [];
  pts.forEach((a, i) => {
    const b = pts[(i + 1) % n]; let nn = [b[1] - a[1], -(b[0] - a[0]), 0];
    if (nn[0] * ((a[0] + b[0]) / 2 - cx) + nn[1] * ((a[1] + b[1]) / 2 - cy) < 0) nn = nn.map((v) => -v);
    faces.push({ poly: [[a[0], a[1], -h], [b[0], b[1], -h], [b[0], b[1], h], [a[0], a[1], h]], n: nn, col: cc, tone });
    rims.push({ a: [a[0], a[1], h], b: [b[0], b[1], h], col: cc, loop: 3 * i }, { a: [a[0], a[1], -h], b: [b[0], b[1], -h], col: cc, loop: 3 * i + 1 }, { a: [a[0], a[1], -h], b: [a[0], a[1], h], col: cc, loop: 3 * i + 2 });
  });
  return { mesh: { faces, rims }, cen: [cx, cy, 0] };
}
function cubeBall(h, m, tone, N = 6) {
  const g = (q) => { const l = Math.hypot(q[0], q[1], q[2]); return q.map((v) => lerp(v * h, v / l * h * 1.04, m)); };
  const faces = [], rims = [], cc = col(tone);
  for (let ax = 0; ax < 3; ax++) for (const sg of [-1, 1]) {
    const u = (ax + 1) % 3, v = (ax + 2) % 3;
    const Q = (i, j) => { const q = [0, 0, 0]; q[ax] = sg; q[u] = -1 + 2 * i / N; q[v] = -1 + 2 * j / N; return g(q); };
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
      const poly = [Q(i, j), Q(i + 1, j), Q(i + 1, j + 1), Q(i, j + 1)], cen = poly.reduce((a, q) => add3(a, q), [0, 0, 0]);
      let nn = cross(sub3(poly[2], poly[0]), sub3(poly[3], poly[1])); if (dot(nn, cen) < 0) nn = nn.map((x) => -x);
      faces.push({ poly, n: nn, col: cc, tone });
    }
  }
  const cs = []; for (const a of [-1, 1]) for (const b of [-1, 1]) for (const c2 of [-1, 1]) cs.push([a, b, c2]);
  cs.forEach((a, i) => cs.forEach((b, j) => { if (j > i && Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]) === 2) { const L = rims.length; for (let k = 0; k < N; k++) rims.push({ a: g(lerp3(a, b, k / N)), b: g(lerp3(a, b, (k + 1) / N)), col: cc, loop: L }); } }));
  return { faces, rims };
}
M.totem = [
  { mesh: boxM(55, 8, 30, 0.9), fy: -92, y0: 70, ax: [1, 0.4, 0.2] },
  { mesh: boxM(32, 32, 32, 0.64), fy: -52, y0: -50, ax: [0.3, 1, 0.6] },
  { mesh: sphereM(30, 0.38, 32, 14), fy: 10, y0: 90, ax: [1, 1, 0], circle: 30 },
  { mesh: extrude([[-34, -30], [34, -30], [0, 30]], 40, 0.12).mesh, fy: 70, y0: -80, ax: [0.2, 0.5, 1] },
];
M.tangram = [[[0, 0], [4, 0], [2, 2]], [[0, 0], [2, 2], [0, 4]], [[4, 2], [4, 4], [2, 4]], [[2, 2], [3, 1], [4, 2], [3, 3]], [[3, 1], [4, 0], [4, 2]], [[2, 2], [3, 3], [1, 3]], [[1, 3], [3, 3], [2, 4], [0, 4]]].map((poly, i) => {
  const pts = poly.map((q) => [q[0] * 50 - 100, q[1] * 50 - 100]), cx = pts.reduce((a, q) => a + q[0], 0) / pts.length, cy = pts.reduce((a, q) => a + q[1], 0) / pts.length;
  const ex = extrude(pts, 26, clamp(((cx + 100) + (100 - cy)) / 400, 0, 1)), ga = i * 2.399, zz = 1 - 2 * (i + 0.5) / 7, rr = Math.sqrt(1 - zz * zz);
  return { ...ex, dir: [rr * Math.cos(ga), zz * 0.8, rr * Math.sin(ga)], ax: [Math.sin(i * 1.7), 1, Math.cos(i * 2.3)] };
});
M.rubik = (() => {
  const rot = (ax, dir) => [Rx, Ry, Rz][ax](dir * HP).map((r) => r.map((v) => Math.round(v)));
  const moves = [[1, 1, 1], [0, 1, -1], [1, -1, -1], [0, -1, 1]], out = [];
  for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++) {
    let p = [x, y, z], O = I3;
    for (let k = moves.length - 1; k >= 0; k--) { const [ax, ly, dir] = moves[k], Rm = rot(ax, dir); const Ri = [0, 1, 2].map((i) => [0, 1, 2].map((j) => Rm[j][i])); const pp = mv(Rm, p); if (Math.round(pp[ax]) === ly) { p = mv(Ri, p); O = mm(Ri, O); } }
    out.push({ mesh: boxM(18, 18, 18, ((x + 1) + (1 - y)) / 4), p0: p, O0: O });
  }
  return { cubes: out, moves, outline: boxM(56, 56, 56, 0.5) };
})();
M.rack = [[0, 64, 0.1], [-37, 0, 0.42], [37, 0, 0.42], [-74, -64, 0.78], [0, -64, 0.78], [74, -64, 0.78]].map(([x, y, t], i) => ({ mesh: sphereM(32, t), fx: x, fy: y, th0: i * 1.9, y0: [60, -80, 20, 90, -40, -10][i], tone: t }));
const coneM = (R, H) => surf((a, v) => [R * v * Math.cos(a), H * v, R * v * Math.sin(a)], { nrm: revN(R / H) });
const bowlM = (r) => surf((a, v) => { const th = v * HP; return [r * Math.sin(th) * Math.cos(a), -r * Math.cos(th), r * Math.sin(th) * Math.sin(a)]; }, { rows: 8, nrm: (a, v) => { const th = v * HP; return [Math.sin(th) * Math.cos(a), -Math.cos(th), Math.sin(th) * Math.sin(a)]; } });
function openBox(hx, H, hz, N = 6) {
  const faces = [], rims = [], cc = col(0.5), quad = (poly, n) => faces.push({ poly, n, col: cc });
  for (let i = 0; i < N; i++) {
    const x0 = -hx + 2 * hx * i / N, x1 = -hx + 2 * hx * (i + 1) / N, z0 = -hz + 2 * hz * i / N, z1 = -hz + 2 * hz * (i + 1) / N;
    quad([[x0, 0, hz], [x1, 0, hz], [x1, H, hz], [x0, H, hz]], [0, 0, 1]);
    quad([[x1, 0, -hz], [x0, 0, -hz], [x0, H, -hz], [x1, H, -hz]], [0, 0, -1]);
    quad([[x0, 0, -hz], [x1, 0, -hz], [x1, 0, hz], [x0, 0, hz]], [0, -1, 0]);
    quad([[hx, 0, z0], [hx, 0, z1], [hx, H, z1], [hx, H, z0]], [1, 0, 0]);
    quad([[-hx, 0, z1], [-hx, 0, z0], [-hx, H, z0], [-hx, H, z1]], [-1, 0, 0]);
  }
  const sq = [[-hx, hz], [hx, hz], [hx, -hz], [-hx, -hz]];
  for (const [y, lp] of [[H, 0], [0, 1]]) sq.forEach((a, k) => { const b = sq[(k + 1) % 4]; for (let j = 0; j < N; j++) rims.push({ a: [lerp(a[0], b[0], j / N), y, lerp(a[1], b[1], j / N)], b: [lerp(a[0], b[0], (j + 1) / N), y, lerp(a[1], b[1], (j + 1) / N)], col: cc, loop: lp }); });
  sq.forEach((a, k) => rims.push({ a: [a[0], 0, a[1]], b: [a[0], H, a[1]], col: cc, loop: 2 + k }));
  return { faces, rims };
}
M.nibCone = coneM(38, 96);
M.nibCyl = cyl(38, 16);
M.qt = [openBox(24, 48, 24), cyl(24, 48), coneM(24, 48), bowlM(24)];
M.crate = (() => {
  const hx = 46, H = 92, N = 8, cc = col(0.5), F = [
    { P: (u, v) => [-hx + 2 * hx * u, H * v, hx], n: [0, 0, 1] },
    { P: (u, v) => [hx - 2 * hx * u, H * v, -hx], n: [0, 0, -1] },
    { P: (u, v) => [hx, H * v, hx - 2 * hx * u], n: [1, 0, 0] },
    { P: (u, v) => [-hx, H * v, -hx + 2 * hx * u], n: [-1, 0, 0] },
    { P: (u, v) => [-hx + 2 * hx * u, 0, hx - 2 * hx * v], n: [0, -1, 0] }];
  const cu = [3, 5, 4, 3, 5], cv = [5, 3, 4, 5, 3], out = [];
  F.forEach((fc, k) => {
    const id = (i, j) => ((k % 2 ? N - 1 - i : i) < cu[k] ? 0 : j < cv[k] ? 1 : 2);
    for (let pid = 0; pid < 3; pid++) {
      const faces = [], rims = []; let cen = [0, 0, 0], cnt = 0;
      for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
        if (id(i, j) !== pid) continue;
        const q = [fc.P(i / N, j / N), fc.P((i + 1) / N, j / N), fc.P((i + 1) / N, (j + 1) / N), fc.P(i / N, (j + 1) / N)];
        faces.push({ poly: q, n: fc.n, col: cc }); cen = add3(cen, fc.P((i + 0.5) / N, (j + 0.5) / N)); cnt++;
        for (const [a, b, e0, e1] of [[i, j - 1, 0, 1], [i + 1, j, 1, 2], [i, j + 1, 2, 3], [i - 1, j, 3, 0]]) if (a < 0 || b < 0 || a >= N || b >= N || id(a, b) !== pid) rims.push({ a: q[e0], b: q[e1], col: cc, loop: rims.length });
      }
      if (cnt) out.push({ mesh: { faces, rims }, cen: cen.map((v) => v / cnt), n: fc.n, k: out.length });
    }
  });
  return out;
})();
function boxMesh(u) {
  const h = 40, H = 80, su = Math.sin(u), cu = Math.cos(u), faces = [], rims = [], tc = (x) => col(linT((x + 120) / 240));
  const seg = (a, b, c, loop = 0) => rims.push({ a, b, col: c, loop });
  for (let k = 0; k < 3; k++) { const x0 = -h + k * 80 / 3, x1 = x0 + 80 / 3; faces.push({ poly: [[x0, 0, -h], [x1, 0, -h], [x1, 0, h], [x0, 0, h]], n: [0, -1, 0], col: tc((x0 + x1) / 2) }); }
  seg([-h, 0, -h], [h, 0, -h], tc(0), 1); seg([h, 0, -h], [h, 0, h], tc(h), 1); seg([h, 0, h], [-h, 0, h], tc(0), 1); seg([-h, 0, h], [-h, 0, -h], tc(-h), 1);
  for (const sg of [1, -1]) {
    const P = (y, z) => [sg * (h + y * su), y * cu, z], cw = tc(sg * (h + H / 2));
    for (let k = 0; k < 3; k++) { const y0 = k * H / 3, y1 = (k + 1) * H / 3; faces.push({ poly: [P(y0, -h), P(y1, -h), P(y1, h), P(y0, h)], n: [sg * cu, -su, 0], col: tc(sg * (h + (y0 + y1) / 2)) }); }
    seg(P(H, -h), P(H, h), cw); seg(P(0, -h), P(H, -h), cw); seg(P(0, h), P(H, h), cw);
    const Q = (x, y) => [x, y * cu, sg * (h + y * su)], cz = tc(0);
    for (let k = 0; k < 3; k++) { const x0 = -h + k * 80 / 3, x1 = x0 + 80 / 3; faces.push({ poly: [Q(x0, 0), Q(x1, 0), Q(x1, H), Q(x0, H)], n: [0, -su, sg * cu], col: tc((x0 + x1) / 2) }); }
    seg(Q(-h, H), Q(h, H), cz); seg(Q(-h, 0), Q(-h, H), cz); seg(Q(h, 0), Q(h, H), cz);
  }
  return { faces, rims };
}
function crystalMesh(m) {
  const n = 5, seg = TAU / n, a0 = HP;
  return surf((a, v) => {
    const u = ((((a - a0) % seg) + seg) % seg) - seg / 2, rp = (1 - m) + m * Math.cos(Math.PI / n) / Math.cos(u);
    return [LG_R * v * rp * Math.cos(a), LG_H * v, LG_R * v * rp * Math.sin(a)];
  }, { cols: 120 });
}
function rippleMesh(A, ph) {
  return surf((a, v) => [50 * Math.cos(a), v * (72 + A * Math.sin(3 * a + ph)), 50 * Math.sin(a)], { nrm: horN, rimVs: [0, 1] });
}
function foldMesh(g) {
  const w = 50, H = 90, hd = [-1.5, -0.5, 0.5, 1.5].map((k) => k * g), P = [];
  P[2] = [0, 0];
  P[3] = [w * Math.cos(hd[2]), w * Math.sin(hd[2])];
  P[4] = [P[3][0] + w * Math.cos(hd[3]), P[3][1] + w * Math.sin(hd[3])];
  P[1] = [-w * Math.cos(hd[1]), -w * Math.sin(hd[1])];
  P[0] = [P[1][0] - w * Math.cos(hd[0]), P[1][1] - w * Math.sin(hd[0])];
  const faces = [], rims = [];
  let cx = 0, cz = 0;
  for (let k = 0; k < 4; k++) {
    const n = [Math.sin(hd[k]), 0, -Math.cos(hd[k])];
    cx += (P[k][0] + P[k + 1][0]) / 8; cz += (P[k][1] + P[k + 1][1]) / 8;
    for (let j = 0; j < 8; j++) {
      const a = [lerp(P[k][0], P[k + 1][0], j / 8), lerp(P[k][1], P[k + 1][1], j / 8)], b = [lerp(P[k][0], P[k + 1][0], (j + 1) / 8), lerp(P[k][1], P[k + 1][1], (j + 1) / 8)];
      const cc = col(linT((k * 8 + j + 0.5) / 32));
      faces.push({ poly: [[a[0], 0, a[1]], [b[0], 0, b[1]], [b[0], H, b[1]], [a[0], H, a[1]]], n, col: cc });
      rims.push({ a: [a[0], H, a[1]], b: [b[0], H, b[1]], col: cc, loop: 0 }, { a: [a[0], 0, a[1]], b: [b[0], 0, b[1]], col: cc, loop: 1 });
    }
  }
  for (let k = 0; k <= 4; k++) rims.push({ a: [P[k][0], 0, P[k][1]], b: [P[k][0], H, P[k][1]], col: col(linT(Math.min(31.5, k * 8) / 32)), loop: 2 + k });
  return { mesh: { faces, rims }, cx, cz };
}

// ---- assembly generator: one set of thick, irregular pieces fits two shapes ----
const GSH = {
  tube: { P: (u, v, w) => { const a = TAU * u, r = 46 - 10 * (1 - w); return [r * Math.cos(a), 92 * v - 46, r * Math.sin(a)]; }, el: deg(18), yaw: 0 },
  cone: { P: (u, v, w) => { const a = TAU * u, r = Math.max(0, LG_R * v - 11 * (1 - w)); return [r * Math.cos(a), LG_H * v - 53, r * Math.sin(a)]; }, el: EL0, yaw: 0, apex: 0.38 },
  bowl: { P: (u, v, w) => { const a = TAU * u, th = 0.04 + v * (HP - 0.04), r = 60 - 10 * (1 - w); return [r * Math.sin(th) * Math.cos(a), 30 - r * Math.cos(th), r * Math.sin(th) * Math.sin(a)]; }, el: deg(14), yaw: 0 },
  crate: { P: (u, v, w) => { const a = TAU * u, c = Math.cos(a), sn = Math.sin(a), k = Math.max(Math.abs(c), Math.abs(sn)), h = 44 - 10 * (1 - w); return [h * c / k, 88 * v - 44, h * sn / k]; }, el: deg(20), yaw: deg(45), corners: [0, 1, 2, 3].map((k) => 0.125 + k / 4) },
  hex: { P: (u, v, w) => { const a = TAU * u, sg = Math.PI / 3, q = ((a % sg) + sg) % sg, r = (52 - 10 * (1 - w)) * Math.cos(Math.PI / 6) / Math.cos(q - Math.PI / 6); return [r * Math.cos(a), 90 * v - 45, r * Math.sin(a)]; }, el: deg(22), yaw: deg(12), corners: [0, 1, 2, 3, 4, 5, 6].map((k) => k / 6) },
};
const nrm3 = (v) => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
function rotLog(Rm) {
  const tr = Rm[0][0] + Rm[1][1] + Rm[2][2], ang = Math.acos(clamp((tr - 1) / 2, -1, 1));
  if (ang < 1e-5) return { ax: [0, 1, 0], ang: 0 };
  return { ax: nrm3([Rm[2][1] - Rm[1][2], Rm[0][2] - Rm[2][0], Rm[1][0] - Rm[0][1]]), ang };
}
function makeGen({ from, to, cols = 7, rows = 3, mode = "A", start = "shape", label, note, dur = 6.6, S = 1.75 }) {
  const scatter = start === "scatter"; if (scatter) from = to;
  const NI = 6, NJ = 2, OFF = [0, 0.43, 0.17, 0.66, 0.31], SL = 0.35;
  const vb = (r, u) => (r <= 0 ? 0 : r >= rows ? 1 : r / rows + (0.26 / rows) * Math.sin(TAU * u * 2 + r * 1.7));
  const uk = (r, k, t) => (k + OFF[r % 5] + SL * (t - 0.5)) / cols;
  const chunks = [];
  for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) {
    const pt = (sh, i, j, w) => { const tt = j / NJ, u = lerp(uk(r, k, tt), uk(r, k + 1, tt), i / NI), v = lerp(vb(r, u), vb(r + 1, u), tt); return sh.P(u, v, w); };
    const side = (sh) => {
      const pts = []; for (let w = 0; w < 2; w++) for (let j = 0; j <= NJ; j++) for (let i = 0; i <= NI; i++) pts.push(pt(sh, i, j, w));
      const c = pts.reduce((a, q) => add3(a, q), [0, 0, 0]).map((x) => x / pts.length);
      const um = (uk(r, k, 0.5) + uk(r, k + 1, 0.5)) / 2, vm = (vb(r, um) + vb(r + 1, um)) / 2;
      const tu = nrm3(sub3(sh.P(um + 0.004, vm, 1), sh.P(um - 0.004, vm, 1))), n0 = sub3(sh.P(um, vm, 1), sh.P(um, vm, 0));
      const n = nrm3(sub3(n0, tu.map((x) => x * dot(tu, n0)))), tv = cross(n, tu);
      const F = [[tu[0], tv[0], n[0]], [tu[1], tv[1], n[1]], [tu[2], tv[2], n[2]]];
      return { c, F, n, L: pts.map((q) => { const dd = sub3(q, c); return [dot(tu, dd), dot(tv, dd), dot(n, dd)]; }) };
    };
    const A = side(GSH[from]), B = side(GSH[to]);
    const FT = [0, 1, 2].map((i) => [0, 1, 2].map((j) => A.F[j][i]));
    const idx = chunks.length;
    const al = cross(B.n, [0, -1, 0]), aln = Math.hypot(...al), Q0 = mm(aln > 1e-4 ? Raxis(al, Math.acos(clamp(-B.n[1], -1, 1))) : I3, B.F);
    const Q0T = [0, 1, 2].map((i) => [0, 1, 2].map((j) => Q0[j][i]));
    const sv = nrm3(add3(add3(B.n, nrm3(B.c).map((x) => x * 1.6)), [Math.sin(idx * 3.7) * 0.5, (r - (rows - 1) / 2) * 0.8 + Math.cos(idx * 2.3) * 0.3, Math.cos(idx * 5.1) * 0.5]));
    chunks.push({ r, k, A, B, Q0, rel0: rotLog(mm(Q0T, B.F)), sv, rel: rotLog(mm(FT, B.F)), tax: nrm3([Math.sin(idx * 2.1), 0.6, Math.cos(idx * 1.3)]), vm: (r + 0.5) / rows });
  }
  const n = chunks.length, VI = (i, j, w) => w * (NJ + 1) * (NI + 1) + j * (NI + 1) + i;
  const quads = [];
  for (let j = 0; j < NJ; j++) for (let i = 0; i < NI; i++) quads.push({ v: [VI(i, j, 1), VI(i + 1, j, 1), VI(i + 1, j + 1, 1), VI(i, j + 1, 1)], cut: false });
  for (let j = 0; j < NJ; j++) for (const i of [0, NI]) quads.push({ v: [VI(i, j, 0), VI(i, j + 1, 0), VI(i, j + 1, 1), VI(i, j, 1)], cut: true });
  for (let i = 0; i < NI; i++) for (const j of [0, NJ]) quads.push({ v: [VI(i, j, 0), VI(i + 1, j, 0), VI(i + 1, j, 1), VI(i, j, 1)], cut: true });
  const shE = GSH[to];
  return { label, note, S, dur, gg: true, partSort: true,
    scene: (T, d) => {
      const tip = scatter ? 0 : eo(T / (0.3 * d)), el2 = E((T - (scatter ? 0.08 : 0.56) * d) / ((scatter ? 0.86 : 0.38) * d));
      const el = lerp(lerp(HP, deg(26), tip), shE.el, el2), G = mm(Rx(el), Ry(shE.yaw + TAU * 1.5 * (1 - W(T / d))));
      return { pers: 1 - ramp(T, 0.6 * d, d), parts: chunks.map((ch, ci) => {
        const jit = ((ci * 7) % cols) / cols * 0.03 * d, sb = (rows - 1 - ch.r) * 0.035 * d + jit, sb2 = ch.r * 0.045 * d + jit;
        const sep = Math.min(scatter ? 1 : E((T - 0.3 * d - sb) / (0.12 * d)), 1 - E((T - 0.68 * d - sb2) / (0.14 * d)));
        const gsep = scatter ? 1 - E((T - 0.68 * d) / (0.22 * d)) : Math.min(E((T - 0.3 * d) / (0.2 * d)), 1 - E((T - 0.68 * d) / (0.22 * d)));
        const m = scatter ? 1 : E((T - 0.4 * d - sb * 0.5) / (0.3 * d));
        const dir = nrm3(lerp3(ch.A.n, ch.B.n, m)), c = lerp3(ch.A.c, ch.B.c, m), sc = scatter ? 1 - E((T - 0.3 * d - jit) / (0.36 * d)) : 0;
        const pos = add3(c, [dir[0] * 60 * sep + ch.sv[0] * 80 * sc, dir[1] * 60 * sep + 48 * (ch.r * sep - (rows - 1) / 2 * gsep) + ch.sv[1] * 80 * sc, dir[2] * 60 * sep + ch.sv[2] * 80 * sc]);
        const oe = E((T - 0.03 * d - jit) / (0.4 * d));
        const Q = scatter ? mm(Raxis(ch.tax, 0.6 * sep * sep * Math.sin(Math.PI * oe)), mm(ch.Q0, Raxis(ch.rel0.ax, ch.rel0.ang * oe))) : mm(Raxis(ch.tax, 0.6 * sep * sep * Math.sin(Math.PI * m)), mm(ch.A.F, Raxis(ch.rel.ax, ch.rel.ang * m)));
        const V = ch.A.L.map((l, i) => add3(pos, mv(Q, lerp3(l, ch.B.L[i], m))));
        const cen = V.reduce((a, q) => add3(a, q), [0, 0, 0]).map((x) => x / V.length);
        const faces = quads.map((qd) => { const poly = qd.v.map((i) => V[i]); let nn = cross(sub3(poly[2], poly[0]), sub3(poly[3], poly[1])); const fc = poly.reduce((a, q) => add3(a, q), [0, 0, 0]).map((x) => x / 4); if (dot(nn, sub3(fc, cen)) < 0) nn = nn.map((x) => -x); return { poly, n: nn, col: col(0.5), cut: qd.cut }; });
        const rims = [];
        if (ch.r === rows - 1) for (let i = 0; i < NI; i++) rims.push({ a: V[VI(i, NJ, 1)], b: V[VI(i + 1, NJ, 1)], col: col(0.5), loop: 0 });
        if (ch.r === 0) for (let i = 0; i < NI; i++) rims.push({ a: V[VI(i, 0, 1)], b: V[VI(i + 1, 0, 1)], col: col(0.5), loop: 1 });
        const free = sep > 0.015 && (!scatter || T > 0.14 * d);
        if (scatter) { rims.length = 0; const ring = [[0, 0], [NI, 0], [NI, NJ], [0, NJ]]; for (let e = 0; e < 4; e++) { const [a0, b0] = ring[e], [a1, b1] = ring[(e + 1) % 4], st = Math.max(Math.abs(a1 - a0), Math.abs(b1 - b0)); for (let q = 0; q < st; q++) rims.push({ a: V[VI(a0 + (a1 - a0) * q / st, b0 + (b1 - b0) * q / st, 1)], b: V[VI(a0 + (a1 - a0) * (q + 1) / st, b0 + (b1 - b0) * (q + 1) / st, 1)], col: col(0.5), loop: 0 }); } }
        return { mesh: { faces, rims }, R: G, rim: 1 - ramp(T, (scatter ? 0.2 : 0.14) * d, (scatter ? 0.4 : 0.3) * d), filter: mode === "A" ? (f) => !f.cut || free : (f) => !f.cut };
      }) };
    } };
}

// ---- hierarchical assembly: irregular rigid pieces, sub-assemblies dock first ----
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function makeGen2({ to, n = 12, seed = 1, mode = "A", outline = false, mo = {}, label, note, dur = 8, Sf = 1.75 }) {
  const ez = mo.ease || E;
  const rnd = rng(seed), sh = GSH[to];
  const wU = (u, v) => (sh.corners ? u : u + 0.018 * Math.sin(TAU * 1.5 * v + seed)), wV = (u, v) => v + 0.07 * Math.sin(Math.PI * v) * Math.sin(TAU * 3 * u + seed * 1.3);
  const P = (u, v, w) => sh.P(wU(u, v), wV(u, v), w);
  const root = { u0: 0, u1: 1, v0: 0, v1: 1 }; let leaves = [root];
  while (leaves.length < n) {
    let best = null, bs = -1;
    for (const c of leaves) { if (sh.apex && c.v0 === 0 && c.v1 <= sh.apex + 1e-9) continue; const sc = (c.u1 - c.u0) * 3 * (c.v1 - c.v0) * (0.5 + rnd()); if (sc > bs) { bs = sc; best = c; } }
    let f = 0.28 + 0.44 * rnd(), cut = (best.u1 - best.u0) * 3 > (best.v1 - best.v0) * (0.7 + 0.6 * rnd());
    if (sh.apex && best.v0 === 0) { cut = false; f = sh.apex / best.v1; }
    const A = { ...best }, B = { ...best };
    if (cut) { const m = lerp(best.u0, best.u1, f); A.u1 = m; B.u0 = m; } else { const m = lerp(best.v0, best.v1, f); A.v1 = m; B.v0 = m; }
    for (const k of ["u0", "u1", "v0", "v1"]) delete best[k];
    best.a = A; best.b = B; leaves = leaves.filter((x) => x !== best).concat([A, B]);
  }
  const findLeaf = (u, v) => leaves.findIndex((c) => u >= c.u0 && u < c.u1 && v >= c.v0 && v < c.v1);
  leaves.forEach((c, i) => { c.id = i; });
  const setPar = (nd, par) => { nd.par = par; if (nd.a) { setPar(nd.a, nd); setPar(nd.b, nd); } };
  setPar(root, null);
  const height = (nd) => (nd.a ? 1 + Math.max(height(nd.a), height(nd.b)) : 0), Lh = height(root);
  // leaf meshes
  for (const c of leaves) {
    const n0 = Math.max(2, Math.round((c.u1 - c.u0) * 40)), NJ = Math.max(1, Math.round((c.v1 - c.v0) * 5));
    const us = [c.u0, c.u1]; for (let q = Math.ceil(c.u0 * 48 + 1e-6); q / 48 < c.u1 - 1e-6; q++) us.push(q / 48);
    for (const k of sh.corners || []) if (k > c.u0 + 1e-4 && k < c.u1 - 1e-4) us.push(k);
    us.sort((x, y) => x - y); const NI = us.length - 1;
    const g = (i, j, w) => P(us[i], lerp(c.v0, c.v1, j / NJ), w);
    const faces = [], rims = [], cc = col(0.5);
    for (let i = 0; i < NI; i++) for (let j = 0; j < NJ; j++) {
      const um = (us[i] + us[i + 1]) / 2, vm = lerp(c.v0, c.v1, (j + 0.5) / NJ);
      faces.push({ poly: [g(i, j, 1), g(i + 1, j, 1), g(i + 1, j + 1, 1), g(i, j + 1, 1)], n: sub3(P(um, vm, 1), P(um, vm, 0)), col: cc });
    }
    const side = (pts, nn, pu, pv) => { const uu = ((pu % 1) + 1) % 1; const nb = pv < 0 || pv > 1 ? -1 : findLeaf(uu, pv); faces.push({ poly: pts, n: nn, col: cc, cut: true, nb }); };
    const eps = 1e-4;
    for (let j = 0; j < NJ; j++) {
      const vm = lerp(c.v0, c.v1, (j + 0.5) / NJ);
      side([g(0, j, 0), g(0, j + 1, 0), g(0, j + 1, 1), g(0, j, 1)], sub3(P(c.u0 - 0.003, vm, 0.5), P(c.u0 + 0.003, vm, 0.5)), c.u0 - eps, vm);
      side([g(NI, j, 1), g(NI, j + 1, 1), g(NI, j + 1, 0), g(NI, j, 0)], sub3(P(c.u1 + 0.003, vm, 0.5), P(c.u1 - 0.003, vm, 0.5)), c.u1 + eps, vm);
      rims.push({ a: g(0, j, 1), b: g(0, j + 1, 1), col: cc, loop: 2 }, { a: g(NI, j, 1), b: g(NI, j + 1, 1), col: cc, loop: 3 });
    }
    for (let i = 0; i < NI; i++) {
      const um = (us[i] + us[i + 1]) / 2;
      side([g(i, 0, 1), g(i + 1, 0, 1), g(i + 1, 0, 0), g(i, 0, 0)], sub3(P(um, c.v0 - 0.01, 0.5), P(um, c.v0 + 0.01, 0.5)), um, c.v0 - eps);
      side([g(i, NJ, 0), g(i + 1, NJ, 0), g(i + 1, NJ, 1), g(i, NJ, 1)], sub3(P(um, c.v1 + 0.01, 0.5), P(um, c.v1 - 0.01, 0.5)), um, c.v1 + eps);
      rims.push({ a: g(i, 0, 1), b: g(i + 1, 0, 1), col: cc, loop: 0 }, { a: g(i, NJ, 1), b: g(i + 1, NJ, 1), col: cc, loop: 1 });
    }
    const vs = faces.flatMap((f) => f.poly);
    c.cen = vs.reduce((a, q) => add3(a, q), [0, 0, 0]).map((x) => x / vs.length); c.cnt = vs.length;
    c.r = Math.max(...vs.map((q) => Math.hypot(...sub3(q, c.cen))));
    c.mesh = { faces, rims };
  }
  // groups = subtrees at depth 2; leaves inside a group dock one by one, then groups dock together
  const groups = []; const collect = (nd, dp) => { if (dp === 2 || !nd.a) { const lv = []; const g = (x) => (x.a ? (g(x.a), g(x.b)) : lv.push(x)); g(nd); groups.push({ leaves: lv }); return; } collect(nd.a, dp + 1); collect(nd.b, dp + 1); };
  collect(root, 0);
  const cenOf = (lv) => { const t = lv.reduce((a, c) => a + c.cnt, 0); return lv.reduce((a, c) => add3(a, c.cen.map((x) => x * c.cnt / t)), [0, 0, 0]); };
  const rootC = cenOf(leaves), M = 6;
  groups.forEach((g, gi) => {
    g.cen = cenOf(g.leaves);
    let lam = 1.15;
    for (let i = 0; i < g.leaves.length; i++) for (let j = i + 1; j < g.leaves.length; j++) { const A = g.leaves[i], B = g.leaves[j], dd = Math.hypot(...sub3(A.cen, B.cen)) || 1; lam = Math.max(lam, (A.r + B.r + M) / dd); }
    g.lam = lam; g.s0 = (0.1 + 0.26 * rnd()) * dur; g.oax = nrm3([rnd() - 0.5, rnd() - 0.5, rnd() - 0.5]); g.turns = (0.4 + 0.8 * rnd()) * (rnd() < 0.5 ? -1 : 1);
    g.tax = nrm3([rnd() - 0.5, rnd() - 0.5, rnd() - 0.5]); g.tamp = (0.8 + 1.8 * rnd()) * (rnd() < 0.5 ? -1 : 1); g.tk = rnd() < 0.4 ? (rnd() < 0.5 ? 1 : -1) : 0;
    if (mo.s0) g.s0 = mo.s0(gi, groups.length) * dur;
    if (mo.gAx) { g.oax = mo.gAx; g.tax = mo.gAx; }
    g.turns *= mo.gTurn ?? 1; if (mo.gSame) g.turns = Math.abs(g.turns);
    g.tamp *= mo.tAmp ?? 1; if (mo.tk != null) g.tk = mo.tk * (gi % 2 ? -1 : 1);
    const win = (mo.win ?? 0.13) * dur, seq = mo.seq ?? 1;
    const order = g.leaves.map((c, k) => [c, rnd()]).sort((x, y) => x[1] - y[1]).map((x) => x[0]), stp = seq * Math.min((mo.stp ?? 0.07) * dur, (0.64 * dur - g.s0 - win) / Math.max(1, order.length - 1));
    order.forEach((c, k) => { c.g = g; c.gi = gi; c.d0 = g.s0 + k * stp; c.d1 = c.d0 + win; c.tax = nrm3([rnd() - 0.5, rnd() - 0.5, rnd() - 0.5]); c.tamp = (1 + 2.2 * rnd()) * (rnd() < 0.5 ? -1 : 1); c.tk = rnd() < 0.35 ? (rnd() < 0.5 ? 1 : -1) : 0;
      if (mo.gAx) c.tax = mo.gAx; c.tamp *= mo.tAmp ?? 1; if (mo.tk != null) c.tk = mo.tk * (k % 2 ? 1 : -1); });
    if (g.leaves.length === 1) { const c = g.leaves[0]; c.d0 = c.d1 = g.s0; }
    g.done = Math.max(...g.leaves.map((c) => c.d1));
  });
  const R0 = (mo.R0 ?? 0.66) * dur, R1 = (mo.R1 ?? 0.9) * dur;
  let rootAx = nrm3([rnd() - 0.5, 1, rnd() - 0.5]), rootTurns = (0.3 + 0.5 * rnd()) * (rnd() < 0.5 ? -1 : 1);
  if (mo.rAx) rootAx = nrm3(mo.rAx); if (mo.rTurn != null) rootTurns = mo.rTurn;
  for (const c of leaves) for (const f of c.mesh.faces) if (f.cut) { const o = f.nb >= 0 && f.nb !== c.id ? leaves[f.nb] : null; f.tv = o && o.g === c.g ? Math.max(c.d1, o.d1) : R1; }
  const lamOf = (c, T) => (c.g.leaves.length === 1 ? 1 : 1 + (c.g.lam - 1) * (1 - ez((T - c.d0) / Math.max(1e-3, c.d1 - c.d0))));
  const build = (T, d) => {
      const el = HP + (sh.el - HP) * eo((T - 0.03 * d) / (0.9 * d)), G = mm(Rx(el), Ry(sh.yaw + TAU * 1.25 * (1 - W(T / d))));
      const rg = groups.map((g) => Math.max(...g.leaves.map((c) => Math.hypot(...sub3(c.cen, g.cen)) * lamOf(c, T) + c.r)));
      let lr = 1.1;
      for (let i = 0; i < groups.length; i++) for (let j = i + 1; j < groups.length; j++) lr = Math.max(lr, (rg[i] + rg[j] + M) / (Math.hypot(...sub3(groups[i].cen, groups[j].cen)) || 1));
      const Lam = 1 + (lr - 1) * (1 - ez((T - R0) / (R1 - R0)));
      const Ro = Raxis(rootAx, rootTurns * TAU * (1 - W(clamp(T / R0, 0, 1))));
      const leafW = [];
      const parts = leaves.map((c) => {
        const g = c.g, ug = clamp(T / R0, 0, 1), ul = clamp(T / Math.max(0.05 * d, c.d0), 0, 1);
        const Tl = Raxis(c.tax, c.tamp * Math.sin(Math.PI * ul) + c.tk * TAU * E(ul));
        const Og = Raxis(g.oax, g.turns * TAU * (1 - W(clamp(T / Math.max(0.05 * d, g.s0), 0, 1))));
        const Tg = Raxis(g.tax, g.tamp * Math.sin(Math.PI * ug) + g.tk * TAU * E(ug));
        // leaf within group
        let Mx = Tl, t = add3(mv(Og, sub3(c.cen, g.cen).map((x) => x * lamOf(c, T))), g.cen);
        t = sub3(t, mv(Tl, c.cen));
        // group within root
        const Cg = add3(mv(Ro, sub3(g.cen, rootC).map((x) => x * Lam)), rootC);
        Mx = mm(Tg, Mx); t = add3(mv(Tg, sub3(t, g.cen)), Cg);
        leafW.push([mv(G, add3(t, mv(Mx, c.cen))), c.r]);
        const A = mode === "A";
        return { mesh: c.mesh, R: mm(G, Mx), t: mv(G, t), rim: outline ? 1 - ramp(T, R1 - 0.06 * d, R1 + 0.02 * d) : 1 - ramp(T, 0.14 * d, 0.34 * d), filter: (f) => !f.cut || (A && T > 0.1 * d && T < f.tv) };
      });
      const pers = lerp(0.45, 1, ramp(T, 0.35 * d, 0.62 * d)) * (1 - ramp(T, 0.62 * d, d));
      let need = 0; for (const [w, r] of leafW) { const k = pers > 1e-3 ? 330 / Math.max(40, 330 - (w[2] + r) * pers) : 1; need = Math.max(need, (Math.abs(w[0]) + r) * k, (Math.abs(w[1]) + r) * k); }
      return { fit: Math.min(Sf, 226 / (need + 6)), pers, parts };
  };
  const NS = 80, fitT = Array.from({ length: NS + 1 }, (_, k) => build(dur * k / NS, dur).fit);
  for (let k = NS - 1; k >= 0; k--) fitT[k] = Math.min(fitT[k], fitT[k + 1]);
  return { label, note, dur, S: Sf, gg: true, partSort: true,
    scene: (T, d) => {
      const b = build(T, d), x = clamp(T / d, 0, 1) * NS, k = Math.min(NS - 1, Math.floor(x));
      const Sm = Math.min(lerp(fitT[k], fitT[k + 1], x - k), fitT[Math.min(NS, k + 1)] * 1.0, b.fit);
      return { S: Sm, pers: b.pers, parts: b.parts };
    } };
}

// ---- the library ----
const LIB = {
  logo: { label: "Logo cone", note: "The logo on its own: seen from above as a ring, it spins a turn and a quarter while tipping toward you.", S: 1.86, dur: 6,
    scene: (T, d) => ({ parts: [{ mesh: M.logoCone, c: [0, 50, 0], R: mm(Rx(logoEl(T, d, EL0)), Ry(-TAU * 1.25 * (1 - ios(Math.pow(clamp(T / (0.84 * d), 0, 1), 1.7))))) }] }) },
  facet: { label: "Facet", note: "The logo motion: spins once and a half, tipping toward you.", S: 1.9, dur: 6.2,
    scene: (T, d) => ({ parts: [{ mesh: M.facet, c: [0, 50, 0], R: mm(Rx(logoEl(T, d, deg(21))), Ry(spin(T, d, -1))) }] }) },
  scallop: { label: "Scallop", note: "Rolls a turn and a quarter as it swings out, landing on its side.", S: 1.95, dur: 6.2,
    scene: (T, d) => { const tl = E((T - d * 0.08) / (d * 0.92)); return { parts: [{ mesh: M.scallop, c: [0, 52, 0], R: mm(Rz(-(TAU + TAU / 4) * tl), mm(Rx(HP * (1 - tl)), Ry(spin(T, d, 1)))) }] }; } },
  rosette: { label: "Rosette", note: "Assembly. Seven cones swing their openings outward and gather into a sunburst.", S: 1.9, dur: 6.6,
    scene: (T, d) => {
      const P = W((T - 0.05 * d) / (0.85 * d)), dist = 72 * (1 - P), th = HP * (1 - E((T - 0.04 * d) / (0.86 * d))), roll = -TAU * 0.3 * (1 - W(T / d)), sp = TAU * (1 - W(T / d));
      return { pers: 0.35 * (1 - ramp(T, 0.55 * d, d)), parts: Array.from({ length: 6 }, (_, i) => { const phi = HP + i * TAU / 6 + roll; return { mesh: M.ros6[i], s: lerp(0.55, 0.9, P), R: mm(Rz(phi - HP), mm(Rx(th), Ry(sp))), t: [dist * Math.cos(phi), dist * Math.sin(phi), 0] }; }) };
    } },
  unfurl: { label: "Unfurl", note: "Shape change. The cone turns over and unrolls flat into a fan, revealing its hidden colours.", S: 1.8, dur: 7,
    scene: (T, d) => {
      const m = E((T - 0.5 * d) / (0.45 * d)), el = HP * (1 - E((T - 0.03 * d) / (0.47 * d))) - HP * m;
      const c = lerp3([0, 52, 0], [0, 0, 60], m);
      return { parts: [{ mesh: unfurlMesh(m), c, R: mm(Rx(el), Ry(TAU * (1 - W(T / (0.5 * d))))) }] };
    } },
  telescope: { label: "Telescope", gg: true, note: "Assembly. Three nested rings extend into a stepped tower, turning against each other.", S: 1.72, dur: 6,
    scene: (T, d) => {
      const e = W((T - 0.1 * d) / (0.7 * d)), el = HP + (deg(14) - HP) * E((T - 0.06 * d) / (0.84 * d));
      return { parts: M.tel.map((m, i) => ({ mesh: m, c: [0, 51, 0], o: [0, i * 34 * e, 0], R: mm(Rx(el), Ry((i % 2 ? -1 : 1) * TAU * 1.5 * (1 - W(T / d)))) })) };
    } },
  fan: { label: "Fan", note: "Eleven stacked blades turn face-up together and spread open like a hand fan.", S: 1.85, dur: 6.4,
    scene: (T, d) => ({ parts: M.fan.map((m, j) => {
      const g = Math.PI - (j + 0.5) * Math.PI / 11, P = E((T - 0.08 * d) / (0.62 * d)), ang = HP + (g - HP) * P;
      const G = Ry(Math.PI * (1 - E((T - 0.03 * d) / (0.4 * d))));
      return { mesh: m, R: mm(G, Rz(ang)), t: mv(G, [0, -58, (j - 5) * 3 * (1 - P)]) };
    }) }) },
  armillary: { label: "Armillary", gg: true, note: "Crazy motion. Three nested bands tumble on different axes, then lock into line one by one.", S: 1.78, dur: 6,
    scene: (T, d) => {
      const ax = [[1, 0, 0], [0, 1, 1], [1, 1, 1]], base = [HP, Math.PI, TAU / 3];
      return { parts: M.arm.map((m, i) => {
        const P = W((T - 0.03 * d) / ((0.7 + i * 0.1) * d));
        return { mesh: m, R: mm(Raxis(ax[i], (base[i] + TAU) * (1 - P)), Ry((i % 2 ? -1 : 1) * TAU * (1 - W(T / d)))) };
      }) };
    } },
  mosaic: { label: "Mosaic", note: "Assembly. The logo's eleven slivers fly in, flipping face-up, and lock together left to right.", S: 2.1, dur: 6.6,
    scene: (T, d) => ({ parts: M.mosaic.map((s, j) => {
      const q = 1 - E((T - 0.03 * d - j * 0.05 * d) / (0.36 * d));
      return { mesh: s.mesh, c: [0, -50, 0], t: [s.u[0] * 12 * q, -50 + s.u[1] * 12 * q, (26 + j * 9) * Math.sin(HP * q)], R: Raxis(s.u, Math.PI * q) };
    }) }) },
  unroll: { label: "Unroll", note: "Shape change. A cylinder tips over, then unrolls into a flat strip of all eleven colours.", S: 1.09, dur: 6,
    scene: (T, d) => {
      const m = E((T - 0.46 * d) / (0.46 * d)), el1 = HP + (deg(18) - HP) * W((T - 0.04 * d) / (0.5 * d));
      return { parts: [{ mesh: unrollMesh(m), c: [0, 98, 32 * m], R: mm(Rx(lerp(el1, 0, m)), Ry(TAU * (1 - W(T / (0.5 * d))))) }] };
    } },
  bloom: { label: "Bloom", note: "Assembly. A six-sided funnel opens its petals toward you into a flat star.", S: 1.85, dur: 6.4,
    scene: (T, d) => {
      const roll = -(Math.PI / 3) * (1 - W(T / d));
      return { parts: M.bloom.map((b, i) => { const f = b.f0 * (1 - E((T - 0.03 * d - i * 0.05 * d) / (0.66 * d))), phi = b.phi + roll; return { mesh: b.mesh, R: mm(Rz(phi - HP), Rx(f)), t: [b.ap * Math.cos(phi), b.ap * Math.sin(phi), 0] }; }) };
    } },
  coin: { label: "Coin toss", gg: true, note: "Crazy motion. Tossed up end over end twice, lands, and hops once.", S: 1.57, dur: 6,
    scene: (T, d) => {
      const x = clamp(T / (0.7 * d), 0, 1), P = 1 - Math.pow(1 - x, 2.2), elF = deg(16), el = elF + (HP - elF + 2 * TAU) * (1 - P);
      let y = 70 * 4 * x * (1 - x); const t2 = (T - 0.7 * d) / (0.14 * d); if (t2 > 0 && t2 < 1) y += 9 * 4 * t2 * (1 - t2);
      const sq = 0.2 * Math.exp(-Math.pow((T - 0.7 * d) / 0.08, 2)) + 0.08 * Math.exp(-Math.pow((T - 0.84 * d) / 0.07, 2));
      return { parts: [{ mesh: M.coin, s: [1 + sq * 0.5, 1 - sq, 1 + sq * 0.5], R: mm(Rx(el), Ry(spin(T, d, 1, 0.5))), t: [0, y - 10, 0] }] };
    } },
  triad: { label: "Triad", note: "Assembly. Three triangles circle in, turning over, and lock into one big triangle.", S: 1.8, dur: 6.4,
    scene: (T, d) => ({ parts: M.triad.map((tr, i) => {
      const P = E((T - 0.04 * d - i * 0.07 * d) / (0.72 * d)), q = 1 - P, rot = TAU * 0.75 * q, sc = 0.3 + 0.7 * P;
      return { mesh: tr.mesh, c: [tr.cen[0], tr.cen[1], 0], t: mv(Rz(rot), [tr.cen[0] * sc, tr.cen[1] * sc, 0]), R: mm(Rz(rot), Ry(3 * Math.PI * q)) };
    }) }) },
  gyre: { label: "Gyre", note: "Its lean circles like a slowing gyroscope while the bowl spins the other way.", S: 1.9, dur: 6,
    scene: (T, d) => {
      const el = HP + (0.36 - HP) * eo(T / (0.55 * d)), beta = TAU * 6 * (1 - oc(T / d));
      return { parts: [{ mesh: M.bowl, c: [0, -26, 0], R: mm(Rz(beta), mm(Rx(el), Ry(-TAU * 5 * (1 - oc(T / d))))) }] };
    } },
  diamond: { label: "Diamond", note: "Assembly. Two cones swing their openings together into a diamond.", S: 1.8, dur: 6.2,
    scene: (T, d) => {
      const P = E(T / (0.88 * d)), ay = lerp(52, LG_H * 0.9, E(T / (0.9 * d)));
      return { pers: 0.6 * (1 - ramp(T, 0.55 * d, d)), parts: [1, -1].map((sg) => ({ mesh: M.cone, s: 0.9, R: mm(Rx(HP + sg * HP * P), Ry(sg * spin(T, d, 1))), t: [0, sg * ay, 0] })) };
    } },
  blinds: { label: "Blinds", note: "Assembly. Eleven slats flip over in a wave, top to bottom.", S: 1.9, dur: 6.2,
    scene: (T, d) => ({ parts: M.blinds.map((b, j) => ({ mesh: b.mesh, c: [0, b.y, 0], t: [0, b.y, 0], R: Rx(3 * Math.PI * (1 - E((T - 0.04 * d - j * 0.035 * d) / (0.5 * d)))) })) }) },
  ratchet: { label: "Ratchet", gg: true, note: "Turns in nine clicks that speed up, then ease off.", S: 2.2, dur: 6,
    scene: (T, d) => {
      const wts = [1, 1, 0.8, 0.55, 0.38, 0.32, 0.4, 0.62, 0.95], tot = wts.reduce((a, b) => a + b, 0);
      let acc = 0, k = 9, f = 0; const tt = clamp(T / (0.9 * d), 0, 1) * tot;
      for (let i = 0; i < 9; i++) { if (tt < acc + wts[i]) { k = i; f = (tt - acc) / wts[i]; break; } acc += wts[i]; }
      const ec = f < 0.5 ? 4 * f * f * f : 1 - Math.pow(-2 * f + 2, 3) / 2;
      return { parts: [{ mesh: M.crown, c: [0, 42, 0], R: mm(Rx(stdEl(T, d, deg(20))), Ry((TAU / 6) * (9 - Math.min(9, k + ec)))) }] };
    } },
  implode: { label: "Implode", gg: true, note: "Assembly. Twenty-two panels rush in from all sides to close into a cylinder.", S: 2.19, dur: 6,
    scene: (T, d) => {
      const R = std(T, d, 0.36, -1, 1);
      return { parts: M.imp.map((m, p) => {
        const q = 1 - E((T - 0.03 * d - Math.min(20, (p * 7) % 22) * 0.018 * d) / (0.42 * d)), am = (p + 0.5) * TAU / 22;
        return { mesh: m, c: [0, 45, 0], o: [Math.cos(am) * 28 * q, (((p * 5) % 7) - 3) * 8 * q, Math.sin(am) * 28 * q], R };
      }) };
    } },
  split: { label: "Split", note: "One outline divides in two; the halves turn opposite ways into a bow.", S: 1.9, dur: 6.2,
    scene: (T, d) => {
      const th = HP * (1 - E((T - 0.04 * d) / (0.84 * d))), roll = HP * (1 - W(T / d));
      return { parts: [1, -1].map((sg) => ({ mesh: M.cone, s: 0.9, R: mm(Rz(sg * HP + roll), mm(Rx(th), Ry(sg * spin(T, d, 1)))), t: mv(Rz(roll), [-sg * 2, 0, 0]) })) };
    } },
  ripple: { label: "Ripple", note: "Shape change. The object never spins; a wave runs around its rim and calms.", S: 1.9, dur: 6.2,
    scene: (T, d) => ({ parts: [{ mesh: rippleMesh(14 + 22 * (1 - E(T / (0.9 * d))), -TAU * 1.5 * (1 - W(T / d))), c: [0, 38, 0], R: Rx(stdEl(T, d, deg(20))) }] }) },
  turbine: { label: "Turbine", note: "Eight blades spin down while pitching from back to front.", S: 1.9, dur: 6.4,
    scene: (T, d) => {
      const rot = TAU * 2 * (1 - W(T / d));
      return { parts: M.turb.map((m, i) => ({ mesh: m, R: mm(Rz(i * TAU / 8 + rot), Rx(3 * Math.PI * (1 - E((T - 0.04 * d - i * 0.025 * d) / (0.55 * d))))) })) };
    } },
  bounce: { label: "Bounce", gg: true, note: "Drops in, squashes, and bounces twice before settling.", S: 2.19, dur: 6,
    scene: (T, d) => {
      const t1 = 0.3 * d, t2 = t1 + 0.2 * d, t3 = t2 + 0.1 * d; let y = 0;
      if (T < t1) { const x = T / t1; y = 100 * (1 - x * x); } else if (T < t2) { const x = (T - t1) / (t2 - t1); y = 4 * 40 * x * (1 - x); } else if (T < t3) { const x = (T - t2) / (t3 - t2); y = 4 * 11 * x * (1 - x); }
      const G = (tc, a, w) => a * Math.exp(-Math.pow((T - tc) / w, 2)), sq = G(t1, 0.26, 0.07) + G(t2, 0.13, 0.06) + G(t3, 0.05, 0.05);
      return { parts: [{ mesh: M.tube, s: [1 + sq * 0.6, 1 - sq, 1 + sq * 0.6], R: mm(Rx(HP + (0.36 - HP) * E(T / (0.62 * d))), Ry(spin(T, d, -1))), t: [0, -50 + y, 0] }] };
    } },
  nest: { label: "Nest", note: "Ends as several. Four nested cones slide apart into a row, largest first.", S: 1.4, dur: 6.6,
    scene: (T, d) => {
      const xs = [-111, -8.5, 73.6, 139], sc = [1, 0.78, 0.6, 0.45], di = 0.85 * d;
      return { parts: sc.map((s, i) => { const Ti = T - i * 0.05 * d, P = W((T - 0.08 * d - i * 0.05 * d) / (0.66 * d)); return { mesh: M.cone, s, t: [xs[i] * P, -52 * P, 0], R: mm(Rx(stdEl(Ti, di, EL0)), Ry(spin(Ti, di, i % 2 ? 1 : -1))) }; }) };
    } },
  crystal: { label: "Crystal", note: "Shape change. The smooth cone sharpens into a five-sided pyramid as it turns.", S: 1.95, dur: 6.2,
    scene: (T, d) => ({ parts: [{ mesh: crystalMesh(E((T - 0.3 * d) / (0.55 * d))), c: [0, 52, 0], R: std(T, d, deg(22), 1) }] }) },
  // looseBands: its rings are meant to stop offset, so it keeps its own
  // face-by-face colours rather than settling onto exact bands.
  weave: { label: "Weave", gg: true, looseBands: true, note: "Assembly. Five stacked rings twist against each other and stop offset, leaving a chevron.", S: 2.11, dur: 6,
    scene: (T, d) => {
      const off = [0, 0.16, 0.32, 0.16, 0], el = stdEl(T, d, 0);
      return { parts: off.map((o, i) => ({ mesh: M.weave, c: [0, 50, 0], o: [0, i * 20, 0], R: mm(Rx(el), Ry(o + (i % 2 ? 1 : -1) * TAU * 1.5 * (1 - W((T - i * 0.04 * d) / (0.84 * d))))) })) };
    } },
  orbit: { label: "Orbit", note: "Circles a tilted orbit, passing near and far, and spirals into the centre.", S: 1.9, dur: 6.4,
    scene: (T, d) => {
      const q = 1 - E(T / (0.85 * d)), om = HP + TAU * 1.5 * (1 - W(T / d)), rho = 70 * q;
      return { pers: 1 - ramp(T, 0.7 * d, d), parts: [{ mesh: M.cone, s: 0.85, c: [0, 52, 0], t: [rho * Math.cos(om), rho * Math.sin(om) * 0.35, rho * Math.sin(om)], R: std(T, d, EL0, 1) }] };
    } },
  fold: { label: "Fold", gg: true, note: "Shape change. A flat strip of four panels folds itself into a square tube.", S: 2.2, dur: 6,
    scene: (T, d) => {
      const fm = foldMesh(HP * E((T - 0.06 * d) / (0.6 * d))), el = deg(20) * E((T - 0.35 * d) / (0.6 * d)), yaw = TAU * (1 - W(T / d)) + deg(-18) * E(T / d);
      return { parts: [{ mesh: fm.mesh, c: [fm.cx, 45, fm.cz], R: mm(Rx(el), Ry(yaw)) }] };
    } },
  grid: { label: "Grid", note: "Ends as several. Nine small logos turn over in a diagonal wave.", S: 2.1, dur: 6.8,
    scene: (T, d) => {
      const parts = [], di = 0.72 * d;
      for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) { const Ti = T - (r + c) * 0.07 * d; parts.push({ mesh: M.cone, s: 0.42, c: [0, 52, 0], t: [(c - 1) * 72, (1 - r) * 66, 0], R: mm(Rx(stdEl(Ti, di, EL0)), Ry(spin(Ti, di, -1))), rim: rimAt(Ti, di) }); }
      return { parts };
    } },
  arrival: { label: "Arrival", note: "Flies in from far away on a spiral, growing as it comes.", S: 1.8, dur: 6.4,
    scene: (T, d) => {
      const q = 1 - E(T / (0.72 * d)), an = TAU * 1.25 * (1 - W(T / d)), off = 80 * q;
      return { pers: 1 - ramp(T, 0.72 * d, d), parts: [{ mesh: M.vase, c: [0, 50, 0], t: [off * Math.cos(an), off * Math.sin(an), -1500 * Math.pow(q, 1.4)], R: std(T, d, deg(22), 1) }] };
    } },
  sway: { label: "Sway", note: "Hangs from its rim like a lantern and swings to rest.", S: 1.8, dur: 6.6,
    scene: (T, d) => {
      const tau = Math.max(0, T - 0.42 * d), sw = 0.4 * ramp(T, 0.36 * d, 0.46 * d) * Math.exp(-1.6 * tau) * Math.sin(TAU * tau / 1.5) * (1 - ramp(T, d - 0.4, d));
      return { parts: [{ mesh: M.pent, c: [0, 90, 0], t: [0, 58, 0], R: mm(Rz(sw), std(T, d, deg(22), -1)) }] };
    } },
  draw: { label: "Draw", note: "Its outline draws itself, then colour fills in band by band.", S: 1.75, dur: 6.4,
    scene: (T, d) => {
      const fp = E((T - 0.1 * d) / (0.36 * d));
      return { parts: [{ mesh: M.hex, c: [0, 38, 0], R: std(T, d, deg(30), 1, 1.5, deg(14)), rimFrac: E(T / (0.3 * d)), filter: fp >= 1 ? null : (f) => f.u <= fp }] };
    } },
  stack: { label: "Stack", gg: true, note: "Four hex rings drop one at a time onto the pile, each landing a half-facet turned.", S: 1.96, dur: 6,
    scene: (T, d) => {
      const el = stdEl(T, d, deg(16)), sp = spin(T, d, 1, 1);
      return { parts: [0, 1, 2, 3].map((i) => {
        const tl = 0.04 * d + i * 0.125 * d, x = clamp((T - tl) / (0.28 * d), 0, 1), tb = T - tl - 0.28 * d;
        let y = 90 * (1 - x * x);
        if (tb > 0 && tb < 0.07 * d) y += 7 * Math.sin(Math.PI * tb / (0.07 * d));
        else if (tb >= 0.07 * d && tb < 0.11 * d) y += 2.5 * Math.sin(Math.PI * (tb - 0.07 * d) / (0.04 * d));
        return { mesh: M.stack[3 - i], c: [0, 48, 0], o: [0, i * 24 + y, 0], R: mm(Rx(el), Ry(TAU * 1.5 * (1 - W((T - i * 0.04 * d) / (0.9 * d))))) };
      }) };
    } },
  iris: { label: "Iris", note: "Turns over while six blades close like a camera shutter.", S: 1.7, dur: 6.2,
    scene: (T, d) => {
      const al = deg(35) * (1 - E((T - 0.08 * d) / (0.78 * d))), G = mm(Rz(-0.7 * (1 - W(T / d))), Ry(Math.PI * (1 - E(T / (0.4 * d)))));
      return { parts: M.iris.map((b, i) => ({ mesh: b.mesh, c: [b.V[0], b.V[1], 0], t: mv(G, [b.V[0], b.V[1], 0]), R: mm(G, Rz(al)), zb: i * 0.01 })) };
    } },
  deal: { label: "Deal", note: "Four cards dealt off a face-down deck, each spinning face-up into its corner.", S: 1.95, dur: 6.4,
    scene: (T, d) => ({ parts: M.deal.map((cd, i) => {
      const P = E((T - 0.05 * d - i * 0.13 * d) / (0.4 * d)), q = 1 - P, arc = 26 * Math.sin(Math.PI * P), l = Math.hypot(cd.cx, cd.cy);
      return { mesh: cd.mesh, c: [cd.cx, cd.cy, 0], t: [cd.cx * P - cd.cy / l * arc, cd.cy * P + cd.cx / l * arc, 24 * Math.sin(Math.PI * P)], R: mm(Rz((i % 2 ? -1 : 1) * Math.PI * q), Ry(Math.PI * q)), zb: P > 0 ? 50 + i : 3 - i };
    }) }) },
  tumble: { label: "Tumble", note: "An outline triangle rolls over its own edges, leaving a coloured tile wherever it lands.", S: 2, dur: 6.4,
    scene: (T, d) => {
      const t0 = 0.05 * d, st = 0.14 * d, parts = [];
      M.tum.forEach((tl, k) => { const g = E((T - t0 - k * st) / (0.07 * d)); if (g > 0) parts.push({ mesh: tl.mesh, c: [tl.cen[0], tl.cen[1], 0], t: [tl.cen[0], tl.cen[1], 0], s: 0.7 + 0.3 * g, rim: 0 }); });
      const x = clamp((T - t0) / st, 0, 5), j = Math.min(4, Math.floor(x)), e = E(x - j), B = M.tum[j].B;
      parts.push({ mesh: M.tum[j].mesh, R: Raxis([B[0], B[1], 0], Math.PI * e), filter: () => false, rim: 1 - ramp(T, t0 + 5 * st, t0 + 5 * st + 0.5) });
      return { parts };
    } },
  tiles: { label: "Tiles", note: "Sixteen tiles flip over on their diagonals, spiralling out from the centre.", S: 1.95, dur: 6.2,
    scene: (T, d) => ({ parts: M.tiles.map((tl) => ({ mesh: tl.mesh, c: [tl.cx, tl.cy, 0], t: [tl.cx, tl.cy, 0], R: Raxis([1, 1, 0], Math.PI * (1 - E((T - 0.03 * d - tl.delay * d) / (0.36 * d)))) })) }) },
  unbox: { label: "Unbox", note: "Shape change. An open box turns over and its walls fall open into a flat cross.", S: 1.7, dur: 6.6,
    scene: (T, d) => {
      const u = HP * E((T - 0.3 * d) / (0.55 * d));
      return { parts: [{ mesh: boxMesh(u), c: lerp3([0, 40, 0], [0, 0, 0], u / HP), R: mm(Rx(HP - Math.PI * E((T - 0.03 * d) / (0.8 * d))), Ry(spin(T, d, 1, 0.5))) }] };
    } },
  shards: { label: "Shards", note: "Fourteen uneven shards tumble in from all sides and fit together into the logo cone.", S: 1.86, dur: 6,
    scene: (T, d) => {
      const R0 = std(T, d, EL0, -1, 1);
      return { parts: M.shards.map((sh) => {
        const P = E((T - 0.03 * d - ((sh.k * 5) % 14) * 0.025 * d) / (0.5 * d)), q = 1 - P, dist = 34 + ((sh.k * 7) % 5) * 7, tum = 3.2 * P * q * q;
        return { mesh: sh.mesh, c: [0, 50, 0], o: [sh.dir[0] * dist * q, sh.dir[1] * dist * q, sh.dir[2] * dist * q], R: R0, L: Raxis([sh.dir[2] + 0.3, 1, -sh.dir[0]], tum * (sh.k % 2 ? 1 : -1)), lc: sh.cen };
      }) };
    } },
  dissect: { label: "Dissect", note: "The triangle breaks into four unequal pieces, still hinged together, that swing round into a square.", S: 1.9, dur: 6.8,
    scene: (T, d) => {
      const X = M.diss, h = E((T - 0.3 * d) / (0.56 * d)), G = mm(Rz(-X.align * h), Ry(Math.PI * (1 - E(T / (0.32 * d))))), C = [lerp(X.c0[0], X.c1[0], h), lerp(X.c0[1], X.c1[1], h), 0];
      const rot = (th, P) => mv(Rz(th), [P[0], P[1], 0]);
      const t1 = Math.PI * h, t3 = -Math.PI * h, t4 = Math.PI * h;
      const b1 = sub3([X.D[0], X.D[1], 0], rot(t1, X.D)), b3 = sub3([X.E[0], X.E[1], 0], rot(t3, X.E));
      const Kp = add3(rot(t3, [X.K[0] - X.E[0], X.K[1] - X.E[1]]), [X.E[0], X.E[1], 0]);
      const b4 = add3(mv(Rz(t4), sub3(sub3([X.E[0], X.E[1], 0], rot(t3, X.E)), Kp)), Kp);
      const tf = [[t1, b1], [0, Z3], [t3, b3], [t3 + t4, b4]];
      return { parts: X.pieces.map((m, i) => ({ mesh: m, R: mm(G, Rz(tf[i][0])), t: mv(G, sub3(tf[i][1], C)), zb: i * 0.01 })) };
    } },
  crack: { label: "Crack", note: "Turns to face you, then splits along two jagged seams into uneven halves that slide apart.", S: 1.9, dur: 6.6,
    scene: (T, d) => {
      const R0 = mm(Rx(stdEl(T, d, deg(10))), Ry(spin(T, d, 1, 1))), sp = E((T - 0.55 * d) / (0.38 * d));
      return { parts: M.crack.map((m, i) => { const sg = i ? 1 : -1; const sp2 = E((T - 0.7 * d) / (0.24 * d)); return { mesh: m, c: [0, 50, 0], o: [sg * 16 * sp, 0, 0], R: mm(Rz(-sg * 0.06 * sp2), R0), t: [0, sg * 10 * sp2, 0] }; }) };
    } },
  chart: { label: "Chart", note: "A bar of four unequal strips breaks apart; each turns on end to stand in a rising chart.", S: 2, dur: 6.6,
    scene: (T, d) => {
      const G = Rx(Math.PI * (1 - E(T / (0.3 * d))));
      return { parts: M.chart.map((st, i) => {
        const P = E((T - 0.3 * d - i * 0.07 * d) / (0.42 * d)), pos = [lerp(st.cen[0], st.target[0], P), lerp(st.cen[1], st.target[1], P), 30 * Math.sin(Math.PI * P)];
        return { mesh: st.mesh, c: [st.cen[0], st.cen[1], 0], R: mm(G, Rz(st.rot * P)), t: mv(G, pos) };
      }) };
    } },
  nib: { label: "Nib", gg: true, note: "Three open pieces orbit high above each other, then settle into a nib.", S: 1.55, dur: 6.8,
    scene: (T, d) => {
      const G = Rx(stdEl(T, d, EL0)), om = TAU * 1.25 * (1 - W(T / d));
      const P = [0, 1, 2].map((i) => E((T - 0.06 * d - i * 0.1 * d) / (0.62 * d)));
      const lift = [0, 70 * (1 - P[1]), 70 * (1 - P[1]) + 70 * (1 - P[2])], base = [0, 103, 126], ms = [M.nibCone, M.nibCyl, M.nibCyl];
      return { parts: ms.map((m, i) => { const rho = 42 * (1 - P[i]), th = i * TAU / 3 + om; return { mesh: m, t: mv(G, [rho * Math.cos(th), base[i] + lift[i] - 71, rho * Math.sin(th)]), R: mm(G, Ry((i % 2 ? -1 : 1) * TAU * 1.5 * (1 - W((T - i * 0.04 * d) / (0.9 * d))))) }; }) };
    } },
  quartet: { label: "Quartet", gg: true, note: "A box, a tube, a cone and a bowl circle in two counter-rotating pairs, then line up.", S: 1.55, dur: 7,
    scene: (T, d) => {
      const G = Rx(stdEl(T, d, EL0 * 0.9)), sc = 1 + 0.25 * (1 - E(T / (0.8 * d)));
      const ao = Math.PI * 3 * (1 - W((T - 0.04 * d) / (0.86 * d))), ai = -Math.PI * 3 * (1 - W((T - 0.1 * d) / (0.8 * d)));
      const pl = [[Math.PI + ao, 90], [Math.PI + ai, 30], [ai, 30], [ao, 90]], cs = [Z3, Z3, Z3, [0, -48, 0]];
      return { parts: M.qt.map((m, i) => {
        const [a, r] = pl[i], bob = 14 * Math.sin(TAU * 1.5 * T / d + i * 1.3) * (1 - E(T / (0.8 * d)));
        return { mesh: m, c: cs[i], t: mv(G, [r * sc * Math.cos(a), -24 + bob, r * sc * Math.sin(a)]), R: mm(G, Ry((i % 2 ? -1 : 1) * TAU * (1 - W(T / d)))) };
      }) };
    } },
  crate: { label: "Crate", gg: true, note: "An open box, broken into fifteen uneven shards, tumbles together as it turns.", S: 1.75, dur: 6,
    scene: (T, d) => {
      const G = std(T, d, deg(20), 1, 1, deg(30));
      return { parts: M.crate.map((sh) => {
        const P = E((T - 0.05 * d - ((sh.k * 4) % 15) * 0.022 * d) / (0.5 * d)), q = 1 - P, inpl = sub3(sh.cen, [0, 46, 0]);
        const d0 = add3(sh.n.map((v) => v * 60), inpl.map((v) => v * 0.5)), dl = Math.hypot(...d0), dir = d0.map((v) => v / dl);
        return { mesh: sh.mesh, c: [0, 46, 0], o: dir.map((v) => v * (40 + ((sh.k * 7) % 5) * 8) * q), R: G, L: Raxis(cross(dir, [0.3, 1, 0.2]), 3.4 * P * q * q * (sh.k % 2 ? 1 : -1)), lc: sh.cen };
      }) };
    } },
  totem: { label: "Totem", note: "A slab, a cube, a marble and a wedge circle each other, then stack into a column.", S: 2, dur: 7,
    scene: (T, d) => {
      const G = Rx(deg(24) * (1 - E((T - 0.3 * d) / (0.65 * d)))), orb = TAU * 1.25 * (1 - W(T / d)), lit = 1 - ramp(T, 0.75 * d, d);
      return { parts: M.totem.map((pc, i) => {
        const P = E((T - 0.1 * d - i * 0.06 * d) / (0.72 * d)), th = i * TAU / 4 + 0.4 + orb, rad = 95 * (1 - P);
        return { mesh: pc.mesh, t: mv(G, [rad * Math.cos(th), lerp(pc.y0, pc.fy, P), rad * Math.sin(th)]), R: mm(G, Raxis(pc.ax, (TAU * 1.5 + i) * (1 - P))), fs: E((T - 0.03 * d - i * 0.04 * d) / (0.22 * d)), lit, circle: pc.circle, circleCol: col(0.38) };
      }) };
    } },
  tangram: { label: "Tangram", note: "Seven thick blocks of different shapes swirl in from all around and set into a square.", S: 1.9, dur: 7,
    scene: (T, d) => {
      const G = Rx(0.3 * (1 - E((T - 0.2 * d) / (0.75 * d)))), sw = TAU * (1 - W(T / d)), lit = 1 - ramp(T, 0.78 * d, d);
      return { parts: M.tangram.map((pc, i) => {
        const P = E((T - 0.08 * d - i * 0.05 * d) / (0.62 * d)), q = 1 - P, o = mv(Ry(sw), pc.dir.map((v) => v * 100 * q));
        return { mesh: pc.mesh, c: pc.cen, t: mv(G, add3(pc.cen, o)), R: mm(G, Raxis(pc.ax, (TAU + i * 0.7) * q)), fs: E((T - 0.02 * d - i * 0.03 * d) / (0.2 * d)), lit };
      }) };
    } },
  rubik: { label: "Twist", note: "A scrambled block of 27 cubes twists four times and turns to face you, solved into a gradient.", S: 2, dur: 7.4,
    scene: (T, d) => {
      const X = M.rubik, G = mm(Rx(deg(30) * (1 - E((T - 0.1 * d) / (0.85 * d)))), Ry((deg(40) + Math.PI) * (1 - W(T / d)))), lit = 1 - ramp(T, 0.8 * d, d);
      const parts = X.cubes.map((cb, i) => {
        let p = cb.p0, O = cb.O0;
        for (let k = 0; k < X.moves.length; k++) {
          const [ax, ly, dir] = X.moves[k], s0 = (0.2 + k * 0.15) * d, u = (T - s0) / (0.13 * d);
          if (u <= 0) break;
          if (Math.round(p[ax]) !== ly) continue;
          const Rm = [Rx, Ry, Rz][ax](dir * HP * E(u)); p = mv(Rm, p); O = mm(Rm, O);
          if (u < 1) break;
          p = p.map(Math.round);
        }
        return { mesh: cb.mesh, t: mv(G, p.map((v) => v * 38)), R: mm(G, O), fs: E((T - 0.03 * d - i * 0.004 * d) / (0.18 * d)), lit, rim: 0 };
      });
      parts.push({ mesh: X.outline, R: G, filter: () => false, rim: 1 - ramp(T, 0.14 * d, 0.3 * d) });
      return { parts };
    } },
  rack: { label: "Rack", note: "Six marbles swirl at different speeds, then roll into a triangle.", S: 2, dur: 6.8,
    scene: (T, d) => {
      const G = Rx(0.4 * (1 - E((T - 0.25 * d) / (0.7 * d)))), lit = 1 - ramp(T, 0.78 * d, d);
      return { parts: M.rack.map((m, i) => {
        const P = E((T - 0.06 * d - i * 0.05 * d) / (0.7 * d)), q = 1 - P, th = m.th0 + TAU * (2 + i * 0.3) * (1 - W(T / d)), rho = (60 + i * 12) * q;
        return { mesh: m.mesh, t: mv(G, [m.fx + rho * Math.cos(th), lerp(m.y0, m.fy, P) + 20 * Math.sin(th * 2) * q, rho * Math.sin(th)]), fs: E((T - 0.02 * d - i * 0.03 * d) / (0.2 * d)), lit, circle: 32, circleCol: col(m.tone) };
      }) };
    } },
  melt: { label: "Melt", note: "A cube splits into eight blocks that round into marbles and settle into a ring.", S: 1.9, dur: 7,
    scene: (T, d) => {
      const u1 = E((T - 0.26 * d) / (0.26 * d)), u2 = E((T - 0.48 * d) / (0.44 * d)), m = E((T - 0.3 * d) / (0.32 * d)), lit = 1 - ramp(T, 0.8 * d, d);
      const G = mm(Rx(deg(35.26) * (1 - u2)), Ry((deg(45) + TAU) * (1 - W(T / d)))), parts = [];
      for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) {
        const phi = Math.atan2(sy, sx) + sz * Math.PI / 8, tone = (88 * Math.cos(phi) + 88) / 176, i = parts.length;
        const pos = lerp3(lerp3([sx * 30, sy * 30, sz * 30], [sx * 72, sy * 72, sz * 72], u1), [88 * Math.cos(phi), 88 * Math.sin(phi), 0], u2);
        parts.push({ mesh: cubeBall(30, m, tone), t: mv(G, pos), R: mm(G, Raxis([sy + 0.2, sz, -sx], TAU * E((T - 0.28 * d) / (0.62 * d)))), fs: E((T - 0.02 * d - i * 0.02 * d) / (0.2 * d)), lit });
      }
      return { parts };
    } },
  spectrum: { label: "Spectrum", note: "Colour as motion. Starts a single coral; the bands split apart as it turns, like light through a prism.", S: 1.8, dur: 6.4,
    scene: (T, d) => {
      const sp = E((T - 0.1 * d) / (0.75 * d));
      return { parts: [{ mesh: M.vase, c: [0, 50, 0], R: std(T, d, deg(22), 1), colMap: (t) => col(Math.round((0.5 + (t - 0.5) * sp) * 10) / 10) }] };
    } },
};

function sliceRims(rims, f) {
  if (f == null || f >= 1) return rims;
  if (f <= 0) return [];
  const loops = {};
  rims.forEach((r) => (loops[r.loop || 0] = loops[r.loop || 0] || []).push(r));
  const out = [];
  for (const k in loops) {
    const L = loops[k], x = f * L.length, n = Math.floor(x);
    for (let i = 0; i < n; i++) out.push(L[i]);
    if (n < L.length && x > n) out.push({ ...L[n], b: lerp3(L[n].a, L[n].b, x - n) });
  }
  return out;
}
function rimRuns(rims, P) {
  const same = (u, v) => Math.abs(u[0] - v[0]) + Math.abs(u[1] - v[1]) + Math.abs(u[2] - v[2]) < 1e-6;
  const runs = []; let cur = null;
  for (const r of rims) {
    if (cur && cur.col === r.col && same(cur.last, r.a)) { cur.list.push(r.b); cur.last = r.b; continue; }
    cur = { col: r.col, list: [r.a, r.b], last: r.b }; runs.push(cur);
  }
  return runs.map((run) => ({ col: run.col, pts: run.list.map((q) => { const p = P(q); return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" ") }));
}
const LINE = { vectorEffect: "non-scaling-stroke", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", fill: "none" };

function partWd(pt) {
  const R = pt.R || I3, c = pt.c || Z3, t = pt.t || Z3, o = pt.o || Z3, L = pt.L, lc = pt.lc || Z3;
  const s = pt.s == null ? [1, 1, 1] : typeof pt.s === "number" ? [pt.s, pt.s, pt.s] : pt.s;
  return (p0) => { const p = L ? add3(mv(L, sub3(p0, lc)), lc) : p0; return add3(mv(R, [(p[0] - c[0] + o[0]) * s[0], (p[1] - c[1] + o[1]) * s[1], (p[2] - c[2] + o[2]) * s[2]]), t); };
}
function ggCols(def) {
  if (def._gg) return def._gg;
  const sc = def.scene(def.dur + 0.35, def.dur);
  const xs = sc.parts.map((pt) => { const Wd = partWd(pt), R = pt.R || I3; return { cut: pt.mesh.faces.map((f) => !!f.cut), vis: pt.mesh.faces.map((f) => mv(R, pt.L ? mv(pt.L, f.n) : f.n)[2] > 1e-6), f: pt.mesh.faces.map((f) => f.poly.reduce((a, q) => a + Wd(q)[0], 0) / f.poly.length), r: pt.mesh.rims.map((r) => (Wd(r.a)[0] + Wd(r.b)[0]) / 2) }; });
  let lo = Infinity, hi = -Infinity; xs.forEach((x) => x.f.forEach((v, i) => { if (!x.vis[i]) return; lo = Math.min(lo, v); hi = Math.max(hi, v); }));
  const NB = def.bands || 10, m = (v) => col(Math.floor(clamp((v - lo) / (hi - lo || 1), 0, 0.9999) * NB) / (NB - 1));
  const dk = (c) => c.replace(/oklch\(([\d.]+)/, (_, L) => "oklch(" + Math.max(0.2, parseFloat(L) - 0.11).toFixed(3));
  return (def._gg = { f: xs.map((x) => x.f.map((v, i) => (x.cut[i] ? dk(m(v)) : m(v)))), r: xs.map((x) => x.r.map(m)) });
}
// Where ggCols' colour bands fall on screen in the finished pose. The final
// pose is flat (no perspective), so a world x maps straight to screen x * S.
function ggBands(def) {
  if (def._ggb) return def._ggb;
  const end = def.dur + 0.35, sc = def.scene(end, def.dur), S = sc.S || def.S;
  let lo = Infinity, hi = -Infinity;
  sc.parts.forEach((pt) => {
    const Wd = partWd(pt), R = pt.R || I3;
    pt.mesh.faces.forEach((f) => {
      if (mv(R, pt.L ? mv(pt.L, f.n) : f.n)[2] <= 1e-6) return;
      const v = f.poly.reduce((a, q) => a + Wd(q)[0], 0) / f.poly.length;
      lo = Math.min(lo, v); hi = Math.max(hi, v);
    });
  });
  const NB = def.bands || 10;
  const dk = (c) => c.replace(/oklch\(([\d.]+)/, (_, L) => "oklch(" + Math.max(0.2, parseFloat(L) - 0.11).toFixed(3));
  const cols = Array.from({ length: NB }, (_, i) => col(i / (NB - 1)));
  return (def._ggb = { x1: lo * S, x2: hi * S, cols, dark: cols.map(dk) });
}

// Projects one frame of an object to 2D faces and outline runs.
function projectFrame(def, T) {
  const d = def.dur, sc = def.scene(T, d), S = sc.S || def.S;
  const pers = sc.pers != null ? sc.pers : 1 - ramp(T, d * 0.55, d);
  const D = 330, camZ = pers > 1e-3 ? D / pers : 1e9, dRim = rimAt(T, d);
  const P = (w) => { const k = pers > 1e-3 ? D / Math.max(40, D - w[2] * pers) : 1; return [w[0] * S * k, -w[1] * S * k]; };
  const faces = [], rims = [], gg = def.gg ? ggCols(def) : null;
  for (let pi = 0; pi < sc.parts.length; pi++) { const pt = sc.parts[pi];
    const R = pt.R || I3, c = pt.c || Z3, t = pt.t || Z3, o = pt.o || Z3;
    const s = pt.s == null ? [1, 1, 1] : typeof pt.s === "number" ? [pt.s, pt.s, pt.s] : pt.s;
    const L = pt.L, lc = pt.lc || Z3;
    const Wd = (p0) => { const p = L ? add3(mv(L, sub3(p0, lc)), lc) : p0; const q = mv(R, [(p[0] - c[0] + o[0]) * s[0], (p[1] - c[1] + o[1]) * s[1], (p[2] - c[2] + o[2]) * s[2]]); return [q[0] + t[0], q[1] + t[1], q[2] + t[2]]; };
    const fs = pt.fs == null ? 1 : pt.fs, fc = pt.fc || c;
    const FL = fs < 0.02 ? [] : pt.mesh.faces, f0 = faces.length;
    for (let fi = 0; fi < FL.length; fi++) { const f = FL[fi];
      if (pt.filter && !pt.filter(f)) continue;
      const ws = f.poly.map((p0) => Wd(fs === 1 ? p0 : lerp3(fc, p0, fs))); let cx = 0, cy = 0, cz = 0;
      for (const w of ws) { cx += w[0]; cy += w[1]; cz += w[2]; }
      cx /= ws.length; cy /= ws.length; cz /= ws.length;
      const n0 = L ? mv(L, f.n) : f.n, nw = mv(R, [n0[0] / s[0], n0[1] / s[1], n0[2] / s[2]]);
      if (-nw[0] * cx - nw[1] * cy + nw[2] * (camZ - cz) <= 1e-6) continue;
      faces.push({ cut: !!f.cut, z: cz + (pt.zb || 0), pts: ws.map((w) => { const q = P(w); return q[0].toFixed(1) + "," + q[1].toFixed(1); }).join(" "), col: gg ? gg.f[pi][fi] : pt.lit > 0.001 && f.tone != null ? litCol(f.tone, nw, pt.lit) : pt.colMap ? pt.colMap(f.t) : f.col });
    }
    if (def.partSort && faces.length > f0) { let pz = 0, pc = 0; for (const w of pt.mesh.faces) { for (const q of w.poly) { pz += Wd(q)[2]; pc++; } } pz /= pc; for (let q = f0; q < faces.length; q++) faces[q].z = pz + faces[q].z * 0.002; }
    const ro = pt.rim != null ? pt.rim : dRim;
    if (ro > 0.001 && pt.circle) { const w = Wd(fc), k = pers > 1e-3 ? D / Math.max(40, D - w[2] * pers) : 1, q = P(w); rims.push({ op: ro, runs: [], circ: { cx: q[0], cy: q[1], r: pt.circle * (typeof pt.s === "number" ? pt.s : 1) * S * k, col: pt.circleCol } }); }
    if (ro > 0.001) rims.push({ op: ro, runs: rimRuns(sliceRims(gg ? pt.mesh.rims.map((r, ri) => ({ ...r, col: gg.r[pi][ri] })) : pt.colMap ? pt.mesh.rims.map((r) => ({ ...r, col: pt.colMap(r.t) })) : pt.mesh.rims, pt.rimFrac), (q) => P(Wd(q))) });
  }
  faces.sort((a, b) => a.z - b.z);
  return { faces, rims };
}


// Bounds of one frame in viewBox units, or null when nothing is drawn.
function frameBox(def, T) {
  const { faces, rims } = projectFrame(def, T);
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  const add = (x, y) => { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); };
  for (const f of faces) for (const pair of f.pts.split(" ")) { const [x, y] = pair.split(",").map(Number); add(x, y); }
  for (const g of rims) for (const r of g.runs) for (const pair of r.pts.split(" ")) { const [x, y] = pair.split(",").map(Number); add(x, y); }
  return isFinite(x0) ? { x0, y0, x1, y1 } : null;
}

// Bounds of an object's final pose, cached on the def. Used to scale every
// object to the same finished size and to align its edges.
function finalBox(def) {
  return def._box || (def._box = frameBox(def, def.dur + 0.35) || { x0: -100, y0: -100, x1: 100, y1: 100 });
}

// Bounds of its opening frame, the pose it waits in before it plays.
function firstBox(def) {
  return def._box0 || (def._box0 = frameBox(def, 0) || finalBox(def));
}

// strokeWidth: outline weight in viewBox units, so callers can keep it a
// constant on-screen width whatever size the object is drawn at.
// How long before the end of its motion a banded object crossfades onto
// exact bands.
const EXACT_BANDS = 0.3;

function Scene({ def, T, noFade = false, strokeWidth = 2, gradId }) {
  // The server and the browser can round a coordinate differently in its
  // last digit; the drawing is identical, so that is not a real mismatch.
  const { faces, rims } = projectFrame(def, T);
  const line = { ...LINE, vectorEffect: undefined, strokeWidth };
  // Each face takes its band colour from where its centre lands, so a band's
  // edge snaps to the nearest face and steps between rings of different
  // sizes. As the object settles, the same bands are laid over it as exact
  // vertical strips, so every seam runs in one straight line.
  const bands = def.gg && !def.looseBands && gradId ? ggBands(def) : null;
  const exact = bands ? ramp(T, def.dur - EXACT_BANDS, def.dur) : 0;
  return (
    <g suppressHydrationWarning opacity={noFade ? 1 : ramp(T, 0, 0.9, oc)}>
      {rims.map((g, i) => <g suppressHydrationWarning key={"r" + i} opacity={g.op}>{g.circ && <circle suppressHydrationWarning cx={g.circ.cx.toFixed(1)} cy={g.circ.cy.toFixed(1)} r={g.circ.r.toFixed(1)} stroke={g.circ.col} style={line} />}{g.runs.map((r, j) => <polyline suppressHydrationWarning key={j} points={r.pts} stroke={r.col} style={line} />)}</g>)}
      {faces.map((f, i) => <polygon suppressHydrationWarning key={i} points={f.pts} fill={f.col} stroke={f.col} strokeWidth="1" strokeLinejoin="round" />)}
      {exact > 0.001 && (
        <g opacity={exact}>
          <defs>
            {[["", bands.cols], ["-dark", bands.dark]].map(([suffix, cs]) => (
              <linearGradient key={suffix} id={gradId + suffix} gradientUnits="userSpaceOnUse" x1={bands.x1} x2={bands.x2} y1="0" y2="0">
                {cs.map((c, i) => [<stop key={i + "a"} offset={i / cs.length} stopColor={c} />, <stop key={i + "b"} offset={(i + 1) / cs.length} stopColor={c} />])}
              </linearGradient>
            ))}
          </defs>
          {faces.map((f, i) => { const u = `url(#${gradId}${f.cut ? "-dark" : ""})`; return <polygon suppressHydrationWarning key={i} points={f.pts} fill={u} stroke={u} strokeWidth="1" strokeLinejoin="round" />; })}
        </g>
      )}
    </g>
  );
}

const GEN = [["bowl", "cone", "Bowl → Logo", "A bowl breaks into 21 thick pieces that recast as the logo cone."], ["tube", "crate", "Tube → Crate", "A tube breaks apart and its pieces re-form as a square crate."], ["cone", "hex", "Logo → Hex", "The logo cone shatters and rebuilds as a hexagonal tube."]];
GEN.push(["scatter", "cone", "Scattered → Logo", "Twenty-one pieces start scattered as outlines and gather into the logo cone."], ["scatter", "crate", "Scattered → Crate", "Scattered pieces turn and fly in to lock into a square crate."]);
const lazy = (k, f) => { let v; Object.defineProperty(LIB, k, { configurable: true, enumerable: true, get: () => v || (v = f()) }); };
GEN.forEach(([a, b, lb, nt], i) => { for (const md of ["A", "B"]) lazy("gen" + i + md, () => makeGen(a === "scatter" ? { from: b, to: b, start: "scatter", S: 1.45, mode: md, label: lb, note: nt } : { from: a, to: b, mode: md, label: lb, note: nt })); });
const GEN2 = [["cone", 11, 123, "Logo", "Eleven uneven pieces pair up, tumble as groups, and lock into the logo cone."], ["crate", 13, 7, "Crate", "Thirteen pieces of very different sizes build a crate from small groups up."], ["hex", 12, 1, "Hex", "Pieces orbit each other in pairs before sliding along their seams into a hex tube."], ["bowl", 10, 1, "Bowl", "Ten pieces, some large and some tiny, assemble into a bowl."]];
GEN2.forEach(([to, n, seed, lb, nt], i) => { for (const md of ["A", "B"]) lazy("asm" + i + md, () => makeGen2({ to, n, seed, mode: md, label: lb, note: nt })); });
const snap = (x) => { const u = clamp(x, 0, 1); return 1 - Math.pow(1 - u, 4); };
const HEXMO = [
  ["Vortex", "Everything swirls around the tube's axis; pieces spiral in and slot home one by one.", { rAx: [0, 1, 0], rTurn: 1.5, gAx: [0, 1, 0], gTurn: 1.2, gSame: true, tAmp: 0.4, tk: 0 }],
  ["Tumble", "No orbiting; every piece and group flips end over end, whole turns, before landing.", { rTurn: 0, gTurn: 0.15, tAmp: 1.3, tk: 1, seq: 0, win: 0.2 }],
  ["Planetary", "Groups circle the centre on one tilted ring like planets; pieces orbit inside each group.", { rAx: [0.35, 1, 0.2], rTurn: 1.25, gAx: [0.35, 1, 0.2], gTurn: 1.6, gSame: true, tAmp: 0.25, tk: 0 }],
  ["Snap", "Long still holds, then quick clicks: pieces snap in, one group after another.", { ease: snap, win: 0.08, stp: 0.06, s0: (i, n) => 0.08 + 0.13 * i, R0: 0.76, R1: 0.9, tAmp: 0.7, gTurn: 0.5 }],
  ["Drift", "Slow and weightless: little rotation, long gentle approaches, every group closing at once.", { tAmp: 0.35, tk: 0, gTurn: 0.25, rTurn: 0.2, seq: 0, win: 0.3, s0: () => 0.18, R0: 0.52, R1: 0.92 }],
];
HEXMO.forEach(([lb, nt, mo], i) => { lazy("hexm" + i, () => makeGen2({ to: "hex", n: 12, seed: 1, mode: "B", outline: true, mo, label: lb, note: nt })); });
lazy("hexasm", () => makeGen2({ to: "hex", n: 12, seed: 1, mode: "B", outline: true, label: "Hex assembly", note: "Twelve outlined pieces dock in groups, then the groups tumble together into a hex tube." }));

// ---- armillary family ----
function frame({ n = 72, Ro, Ri, rot = 0, segs = 1, a0 = 0, a1 = TAU, cut = false }) {
  const circ = n >= 24, N = circ ? n : n * segs, cc = col(0.5), faces = [], ro = [], ri = [];
  const pt = (R, k) => {
    if (circ) { const a = a0 + (a1 - a0) * k / N; return [R * Math.cos(a), R * Math.sin(a), 0]; }
    const e = Math.floor(k / segs), f = k / segs - e, A = rot + e * TAU / n, B = rot + (e + 1) * TAU / n;
    return [R * lerp(Math.cos(A), Math.cos(B), f), R * lerp(Math.sin(A), Math.sin(B), f), 0];
  };
  for (let k = 0; k < N; k++) {
    const o0 = pt(Ro, k), o1 = pt(Ro, k + 1), i0 = pt(Ri, k), i1 = pt(Ri, k + 1), u = (k + 0.5) / N;
    faces.push({ poly: [i0, o0, o1, i1], n: [0, 0, 1], col: cc, u, cut });
    ro.push({ a: o0, b: o1, col: cc, loop: 0 });
    if (Ri > 0) ri.push({ a: i0, b: i1, col: cc, loop: 1 });
  }
  const rims = ro.concat(ri);
  if (circ && a1 - a0 < TAU - 1e-6) rims.push({ a: pt(Ri, 0), b: pt(Ro, 0), col: cc, loop: 2 }, { a: pt(Ri, N), b: pt(Ro, N), col: cc, loop: 3 });
  return { faces, rims };
}
function flat(pts, { cut = false, split = 6 } = {}) {
  const n = pts.length, C = [pts.reduce((a, q) => a + q[0], 0) / n, pts.reduce((a, q) => a + q[1], 0) / n, 0], cc = col(0.5), faces = [], rims = [];
  for (let i = 0; i < n; i++) {
    const a = pts[i], b = pts[(i + 1) % n];
    for (let j = 0; j < split; j++) {
      const p0 = [lerp(a[0], b[0], j / split), lerp(a[1], b[1], j / split), 0], p1 = [lerp(a[0], b[0], (j + 1) / split), lerp(a[1], b[1], (j + 1) / split), 0];
      faces.push({ poly: [C, p0, p1], n: [0, 0, 1], col: cc, cut });
      rims.push({ a: p0, b: p1, col: cc, loop: 0 });
    }
  }
  return { faces, rims };
}
const merge = (...ms) => ({ faces: ms.flatMap((m) => m.faces), rims: ms.flatMap((m) => m.rims) });
const xf = (m, R, t = Z3) => ({ faces: m.faces.map((f) => ({ ...f, poly: f.poly.map((p) => add3(mv(R, p), t)), n: mv(R, f.n) })), rims: m.rims.map((r) => ({ ...r, a: add3(mv(R, r.a), t), b: add3(mv(R, r.b), t) })) });
function mobiusMesh(ph) {
  const R = 80, w = 24, pos = (a, v) => { const tw = (a - ph) / 2, s = (v * 2 - 1) * w, r = R + s * Math.cos(tw); return [r * Math.cos(a), s * Math.sin(tw), r * Math.sin(a)]; };
  const A = surf(pos, { a0: ph, a1: ph + TAU, cols: 120, rows: 1, rimVs: [0, 1] }), B = surf(pos, { a0: ph, a1: ph + TAU, cols: 120, rows: 1, rimVs: [], flip: true });
  const tag = (f, i) => ({ ...f, u: i / 120 });
  return { faces: A.faces.map(tag).concat(B.faces.map(tag)), rims: A.rims };
}
M.gim = [[78, 14], [60, 32], [42, 50]].map(([r, h]) => cyl(r, h, -h / 2));
M.orr = [[56, 12, 1.1, 0, 2.25], [104, 12, -1.2, 1.4, 1.5]].map(([r, pr, inc, b, k]) => ({ r: r + pr + 4, pr, inc, b, k, track: cyl(r, 10, -5), planet: merge(cyl(pr, 10, -5), xf(frame({ Ro: pr, Ri: 0, n: 36 }), Rx(-HP), [0, 5, 0])) }));
M.astro = { base: frame({ Ro: 72, Ri: 0, n: 96 }), rete: xf(frame({ Ro: 40, Ri: 32, cut: true }), I3, [0, 18, 0]), plate: frame({ Ro: 104, Ri: 82, n: 96 }) };
M.gyro = { cage: cyl(76, 12, -6), disc: cyl(46, 18, -9) };
M.hoops = [100, 70, 40].map((r) => frame({ Ro: r, Ri: r - 16, n: Math.max(36, Math.round(r * 0.9)) }));
M.compass = { a: frame({ Ro: 100, Ri: 88, n: 96 }), b: frame({ Ro: 87.5, Ri: 76, n: 90 }), needle: flat([[0, 66], [12, 0], [0, -66], [-12, 0]]) };
M.sext = { arc: frame({ Ro: 112, Ri: 92, n: 48, a0: deg(40), a1: deg(140) }), arm: flat([[-5, 0], [5, 0], [3, 122], [-3, 122]], { cut: true }), pivot: frame({ Ro: 12, Ri: 0, n: 24, cut: true }) };
M.globe = { mer: Array.from({ length: 6 }, () => frame({ Ro: 90, Ri: 83, n: 72 })), lat: [-42, 0, 42].map((y) => cyl(Math.sqrt(97 * 97 - y * y), 4, y - 2)) };
M.hinge = frame({ Ro: 46, Ri: 34, n: 60 });
M.sun = (() => { const al = deg(60), R = 88, H = R * Math.tan(deg(35)), B = [R * Math.cos(al), R * Math.sin(al)], C = [B[0] - H * Math.sin(al), B[1] + H * Math.cos(al)];
  return { disc: merge(frame({ Ro: 30, Ri: 0 }), frame({ Ro: 60, Ri: 30 }), frame({ Ro: 88, Ri: 60 })), fin: flat([[0, 0], B, C], { cut: true }), al }; })();
M.npoly = [frame({ n: 6, Ro: 100, Ri: 88, rot: 0, segs: 10 }), frame({ n: 4, Ro: 72, Ri: 60, rot: deg(45), segs: 10 }), frame({ n: 3, Ro: 40, Ri: 26, rot: HP, segs: 10 })];
Object.assign(LIB, {
  gimbal: { label: "Gimbal", gg: true, note: "Three hinged rings, each turning inside the last, lock flat from the outside in.", S: 2.1, dur: 7,
    scene: (T, d) => {
      let acc = mm(Rx(stdEl(T, d, 0)), Ry(spin(T, d, 1, 1)));
      const ax = [Rx, Rz, Rx], A = [TAU, -TAU * 1.5, TAU * 1.5];
      return { parts: M.gim.map((m, i) => { const P = W((T - 0.03 * d) / ((0.5 + i * 0.16) * d)); acc = mm(acc, ax[i](A[i] * (1 - P))); return { mesh: m, R: acc }; }) };
    } },
  orrery: { label: "Orrery", gg: true, note: "Two beads race round tracks that tilt and level out again.", S: 1.5, dur: 7,
    scene: (T, d) => {
      const G = mm(Rx(stdEl(T, d, deg(30))), Ry(spin(T, d, -1, 0.5))), parts = [];
      M.orr.forEach((o, i) => {
        const P = W((T - 0.03 * d) / ((0.62 + i * 0.1) * d)), R = mm(G, Raxis([Math.cos(o.b), 0, Math.sin(o.b)], o.inc * Math.sin(Math.PI * P))), ph = (i ? Math.PI : 0) + TAU * o.k * (1 - W((T - 0.03 * d) / (0.85 * d)));
        const sh = Z3; parts.push({ mesh: o.track, R, t: sh }, { mesh: o.planet, R, t: add3(sh, mv(R, [o.r * Math.cos(ph), 0, o.r * Math.sin(ph)])) });
      });
      return { parts };
    } },
  astrolabe: { label: "Astrolabe", gg: true, note: "An outer plate tumbles over a turning dial, then settles to frame it.", S: 1.8, dur: 7,
    scene: (T, d) => {
      const G = mm(Rx(stdEl(T, d, 0)), Rz(spin(T, d, 1, 0.75))), P = W((T - 0.03 * d) / (0.82 * d)), X = M.astro;
      return { parts: [
        { mesh: X.base, R: G },
                { mesh: X.plate, R: mm(G, Raxis([1, 0.5, 0], TAU * (1 - P))), t: mv(G, [0, 0, 6]) },
      ] };
    } },
  gyroscope: { label: "Gyroscope", gg: true, note: "A fast inner disc keeps spinning while its slow cage tips toward you.", S: 2.1, dur: 7,
    scene: (T, d) => {
      const G = mm(Rx(stdEl(T, d, deg(16))), Ry(spin(T, d, 1, 1))), P = W((T - 0.03 * d) / (0.8 * d)), C = mm(G, Raxis([1, 0, 0.6], TAU * (1 - P)));
      return { parts: [{ mesh: M.gyro.cage, R: C }, { mesh: M.gyro.disc, R: mm(C, mm(Rz(0.7 * Math.sin(Math.PI * P)), Ry(-TAU * 6 * (1 - oc(T / d))))) }] };
    } },
  hoops: { label: "Hoop cascade", gg: true, note: "Five rings flip in a staggered ripple, outermost first, landing as a bullseye.", S: 1.7, dur: 7,
    scene: (T, d) => {
      const G = Rx(stdEl(T, d, 0));
      return { parts: M.hoops.map((m, i) => { const P = W((T - (0.03 + i * 0.1) * d) / (0.62 * d)), a = i * 0.7; return { mesh: m, R: mm(G, Raxis([Math.cos(a), Math.sin(a), 0], TAU * 1.5 * (1 - P))) }; }) };
    } },
  compass: { label: "Compass rose", gg: true, note: "Two crossed rings fold flat around a needle that swings to rest.", S: 1.75, dur: 7,
    scene: (T, d) => {
      const u = clamp(T / d, 0, 1), G = mm(Rx(stdEl(T, d, 0)), Ry(spin(T, d, 1, 1))), P = E((T - 0.2 * d) / (0.6 * d));
      const th = -deg(45) + 2.4 * (1 - E(u)) * Math.cos(TAU * 1.75 * u);
      return { parts: [{ mesh: M.compass.a, R: G }, { mesh: M.compass.b, R: mm(G, Ry(HP * (1 - P))) }, { mesh: M.compass.needle, R: mm(G, Rz(th)) }] };
    } },
  sextant: { label: "Sextant", gg: true, note: "A quarter arc turns in while its arm swings, each swing shorter than the last.", S: 1.9, dur: 7,
    scene: (T, d) => {
      const u = clamp(T / d, 0, 1), G = mm(Rx(stdEl(T, d, 0)), Ry(spin(T, d, -1, 1))), X = M.sext;
      const th = -deg(20) + 0.9 * (1 - E(u / 0.92)) * Math.cos(TAU * 2.25 * u);
      return { parts: [{ mesh: X.arc, R: G, t: mv(G, [0, -58, 0]) }, { mesh: X.arm, R: mm(G, Rz(th)), t: mv(G, [0, -58, 2]) }] };
    } },
  mobius: { label: "Möbius", note: "A Möbius strip tumbles while its twist runs round the loop, settling tilted toward you.", S: 1.75, dur: 7.4,
    scene: (T, d) => {
      const ph = -HP + TAU * 1.25 * (1 - oc(T / (0.9 * d))), rv = E(T / (0.25 * d));
      const el = deg(40) * eo((T - 0.02 * d) / (0.85 * d)), roll = 0.7 * Math.sin(Math.PI * clamp(T / (0.3 * d), 0, 1)) * (1 - E((T - 0.15 * d) / (0.6 * d)));
      return { parts: [{ mesh: mobiusMesh(ph), R: mm(Rx(el), mm(Rz(roll), Ry(spin(T, d, 1, 1)))), filter: rv >= 1 ? null : (f) => f.u < rv }] };
    } },
  globe: { label: "Globe cage", gg: true, note: "A wire globe's meridians fold shut like a fan, leaving horizon lines.", S: 1.36, dur: 6,
    scene: (T, d) => {
      const G = mm(Rx(stdEl(T, d, 0)), Ry(spin(T, d, 1, 1.5))), P = E((T - 0.2 * d) / (0.66 * d));
      return { parts: M.globe.mer.map((m, i) => ({ mesh: m, R: mm(G, Ry(i * Math.PI / 6 * (1 - P))) })).concat(M.globe.lat.map((m) => ({ mesh: m, R: G }))) };
    } },
  hinge: { label: "Hinge chain", gg: true, note: "Three hinged rings, the outer two standing up, swing open flat one after another.", S: 1.5, dur: 7,
    scene: (T, d) => {
      const G = mm(Rx(stdEl(T, d, 0)), Ry(spin(T, d, -1, 1)));
      const f0 = -HP * (1 - E((T - 0.22 * d) / (0.34 * d))), f2 = HP * (1 - E((T - 0.5 * d) / (0.34 * d)));
      const side = (sg, f) => { const Rr = Ry(f); return { mesh: M.hinge, R: mm(G, Rr), t: mv(G, add3([sg * 46, 0, 0], mv(Rr, [sg * 46, 0, 0]))) }; };
      return { parts: [side(-1, f0), { mesh: M.hinge, R: G }, side(1, f2)] };
    } },
  sundial: { label: "Sundial", gg: true, note: "A shadow sweeps around the dial, then the fin folds down into it.", S: 1.8, dur: 7,
    scene: (T, d) => {
      const X = M.sun, G = mm(Rx(stdEl(T, d, 0)), Rz(spin(T, d, 1, 0.75))), sg = X.al + TAU * 1.25 * (1 - W((T - 0.03 * d) / (0.8 * d)));
      const psi = HP * (1 - E((T - 0.6 * d) / (0.32 * d))), gap = (f) => (((f.u * TAU - sg) % TAU) + TAU) % TAU >= deg(35), t = mv(G, [0, -12, 0]);
      return { parts: [{ mesh: X.disc, R: G, t, filter: gap }, { mesh: X.fin, R: mm(G, Raxis([Math.cos(X.al), Math.sin(X.al), 0], psi)), t }] };
    } },
  polygons: { label: "Nested polygons", gg: true, note: "A hexagon, square and triangle tumble on their own axes and land nested.", S: 1.8, dur: 7,
    scene: (T, d) => {
      const ax = [[1, 0, 0], [0, 1, 1], [1, 1, 1]], base = [HP, Math.PI, TAU / 3];
      return { parts: M.npoly.map((m, i) => { const P = W((T - 0.03 * d) / ((0.7 + i * 0.1) * d)); return { mesh: m, R: mm(Raxis(ax[i], (base[i] + TAU) * (1 - P)), Ry((i % 2 ? -1 : 1) * TAU * (1 - W(T / d)))) }; }) };
    } },
});
export { LIB, Scene, finalBox, firstBox };
