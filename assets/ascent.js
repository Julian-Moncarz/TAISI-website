/* "But what is AI safety?": an exponential curve painted in as you scroll. The section is
   tall and its contents stick to the screen; scroll progress draws the curve, lights each
   dated point as the line reaches it, and swaps in that point's text. The dashed tail is the
   part that hasn't happened yet. Reduced motion, or no JS, shows the finished picture. */
(function () {
  "use strict";
  var sec = document.querySelector("[data-ascent]");
  if (!sec) return;
  var svg = sec.querySelector(".ascent-svg");
  var NS = "http://www.w3.org/2000/svg";
  var K = 3.4;                            // steepness of the exponential
  var DOTS = [0.3, 0.7, 0.84];            // where 2023, July 2026 and Sept 2026 sit on the curve
  var LABELS = ["2023", "July 2026", "Sept 2026"];
  var END = DOTS[DOTS.length - 1];

  function pt(u) {
    return [60 + 880 * u, 510 - 460 * (Math.exp(K * u) - 1) / (Math.exp(K) - 1)];
  }
  function build(u0, u1, n) {
    var pts = [], len = [0];
    for (var i = 0; i <= n; i++) {
      var p = pt(u0 + (u1 - u0) * i / n);
      if (i) len.push(len[i - 1] + Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]));
      pts.push(p);
    }
    return { d: "M" + pts.map(function (p) { return p[0].toFixed(1) + " " + p[1].toFixed(1); }).join("L"), total: len[n], len: len, n: n, u0: u0, u1: u1 };
  }
  var main = build(0, END, 120), tail = build(END, 1, 30);
  function lengthAt(u) {                   // arc length along the main curve up to u
    var i = Math.round((u - main.u0) / (main.u1 - main.u0) * main.n);
    return main.len[Math.max(0, Math.min(main.n, i))];
  }

  var line = svg.querySelector(".a-line"), wash = svg.querySelector(".a-wash"), tailEl = svg.querySelector(".a-tail");
  [line, wash].forEach(function (el) { el.setAttribute("d", main.d); el.style.strokeDasharray = main.total + " " + main.total; });
  tailEl.setAttribute("d", tail.d);

  // the dashed tail is revealed through a mask, so its own dash pattern survives
  var defs = svg.querySelector("defs");
  var mask = document.createElementNS(NS, "mask");
  mask.setAttribute("id", "aTailMask");
  mask.setAttribute("maskUnits", "userSpaceOnUse");
  var mpath = document.createElementNS(NS, "path");
  mpath.setAttribute("d", tail.d);
  mpath.setAttribute("fill", "none");
  mpath.setAttribute("stroke", "#fff");
  mpath.setAttribute("stroke-width", "14");
  mpath.style.strokeDasharray = tail.total + " " + tail.total;
  mask.appendChild(mpath);
  defs.appendChild(mask);
  tailEl.setAttribute("mask", "url(#aTailMask)");

  // a painted wash under the curve, uncovered left to right as the line advances
  var all = build(0, 1, 150);
  var area = document.createElementNS(NS, "path");
  area.setAttribute("d", all.d + "L940 540L60 540Z");
  area.setAttribute("class", "a-area");
  area.setAttribute("fill", "url(#aAreaFill)");
  area.setAttribute("filter", "url(#aWash)");
  area.setAttribute("clip-path", "url(#aAreaClip)");
  var grad = document.createElementNS(NS, "linearGradient");
  grad.setAttribute("id", "aAreaFill");
  grad.setAttribute("x1", "0"); grad.setAttribute("y1", "0"); grad.setAttribute("x2", "0"); grad.setAttribute("y2", "1");
  grad.innerHTML = '<stop offset="0" stop-color="#C4A3E8" stop-opacity=".55"/><stop offset=".55" stop-color="#D9A0C8" stop-opacity=".22"/><stop offset="1" stop-color="#FFC56B" stop-opacity=".08"/>';
  var clip = document.createElementNS(NS, "clipPath");
  clip.setAttribute("id", "aAreaClip");
  clip.innerHTML = '<rect x="0" y="0" width="0" height="560"/>';
  defs.appendChild(grad);
  defs.appendChild(clip);
  var clipRect = clip.firstChild;
  svg.insertBefore(area, wash);
  function headX(drawn) {                 // x of the line's leading point
    for (var i = 0; i <= main.n; i++) if (main.len[i] >= drawn) return pt(main.u0 + (main.u1 - main.u0) * i / main.n)[0];
    return pt(END)[0];
  }

  var dotsG = svg.querySelector(".a-dots"), dots = [], labels = [];
  DOTS.forEach(function (u, i) {
    var p = pt(u);
    var g = document.createElementNS(NS, "g");
    g.setAttribute("class", "a-dot");
    g.innerHTML = '<circle class="halo" cx="' + p[0] + '" cy="' + p[1] + '" r="17"/><circle class="core" cx="' + p[0] + '" cy="' + p[1] + '" r="8"/>';
    dotsG.appendChild(g);
    dots.push(g);
    var t = document.createElementNS(NS, "text");
    t.setAttribute("class", "a-label");
    t.setAttribute("x", p[0] - 20);
    t.setAttribute("y", p[1] - 24);
    t.setAttribute("text-anchor", "end");
    t.textContent = LABELS[i];
    dotsG.appendChild(t);
    labels.push(t);
  });

  var steps = sec.querySelectorAll(".ascent-steps li");
  function show(step) {
    steps.forEach(function (li) { li.classList.toggle("on", +li.dataset.step === step); });
  }
  function clamp(x) { return Math.max(0, Math.min(1, x)); }

  function draw(p) {
    var f = clamp((p - 0.04) / 0.66);                    // main curve: 4% to 70% of the scroll
    var drawn = f * main.total;
    line.style.strokeDashoffset = wash.style.strokeDashoffset = main.total - drawn;
    var reached = -1;
    DOTS.forEach(function (u, i) {
      var on = drawn >= lengthAt(u) - 1;
      if (on) reached = i;
      dots[i].classList.toggle("on", on);
      labels[i].classList.toggle("on", on);
    });
    dots.forEach(function (d, i) { d.classList.toggle("current", i === reached); });
    var t = clamp((p - 0.72) / 0.16);                    // the tail: 72% to 88%
    mpath.style.strokeDashoffset = tail.total * (1 - t);
    var x = drawn > 0 ? headX(drawn) : 0;
    if (t > 0) x = pt(END + (1 - END) * t)[0];
    clipRect.setAttribute("width", x);
    show(p >= 0.78 ? 3 : reached);
  }

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) {
    draw(1);
    steps.forEach(function (li) { li.classList.add("on"); });
    sec.querySelector(".ascent-hint").hidden = true;
    return;
  }

  sec.classList.add("is-live");
  var ticking = false;
  function update() {
    ticking = false;
    var r = sec.getBoundingClientRect();
    var span = sec.offsetHeight - window.innerHeight;
    draw(span > 0 ? clamp(-r.top / span) : 1);
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  window.addEventListener("resize", update);
  update();
})();
