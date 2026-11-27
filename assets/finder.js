/* Resources path-finder: pick who you are (and, for students, where you're starting), and the
   chosen tile floats up into the breadcrumb while the next step appears. The path lives in the URL
   hash (#student/deeper), so the back button and shared links work. Below the guide,
   every resource is listed once. */
(function () {
  "use strict";
  var root = document.querySelector("[data-finder]");
  if (!root) return;

  var L = "/images/logos/", R = "/images/logos/resources/", P = "/images/people/";
  var SH = "/assets/shards/";   // TAISI's own items carry a watercolour shard
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- building blocks (programs were checked against their official pages in November 2026) ----
  var BOOKING = "https://cal.com/yosya/hi";
  var INTEREST = "/interest?from=resources";
  var TAISI_LUMA = "https://luma.com/taisi";
  var TL_LUMA = "https://luma.com/trajectory-labs";

  var INTRO = { name: "Intro fellowship", cta: "Express interest", shard: SH + "shard-4.svg", href: INTEREST, wash: "gold",
    status: "Applications open late December",
    note: "Six weekly dinner discussions, led by people working in AI safety full-time." };
  var BOOK = { name: "Book a one-on-one with a TAISI exec", shard: SH + "shard-2.svg", href: BOOKING, wash: "lilac",
    note: "A short call about where to start, which program fits, or anything else on your mind." };
  var BOOK_FACULTY = { name: "Book a one-on-one with one of our execs", shard: SH + "shard-2.svg", href: BOOKING, wash: "gold",
    note: "Tell us about your work and how you'd like to be involved." };
  var APPLY = { name: "Membership", cta: "Apply", shard: SH + "shard-1.svg", href: "/membership?from=resources", wash: "lilac",
    note: "For U of T students who have finished our intro fellowship or have equivalent experience in AI safety." };
  var MENTOR_INTEREST = { name: "Mentored research program", cta: "Express interest", shard: SH + "shard-7.svg", wash: "rose", status: "Applications open in January",
    href: "/interest/mentorship?from=resources",
    note: "Mentored projects in technical AI safety, governance or philosophy." };
  var AISC = { name: "AI Safety Camp", logo: R + "aisc.png", href: "https://www.aisafety.camp/", wash: "lilac", note: "Remote, part-time team projects." };
  var SPAR = { name: "SPAR", logo: R + "spar.png", href: "https://sparai.org/", wash: "plum", note: "Part-time, remote research, open to undergraduates." };
  var TL_EVENTS = { name: "Trajectory Labs events", logo: R + "trajectory.png", href: TL_LUMA, wash: "rose",
    note: "Talks, coworking and AI Safety Thursdays at Toronto's AI safety hub near King station." };

  var G = {
    courses: { name: "Introductory courses", items: [
      { name: "BlueDot Impact", logo: L + "bluedot.png", href: "https://bluedot.org/courses", note: "Free online cohort courses." },
      { name: "AI Safety, Ethics and Society", logo: L + "cais-icon.png", href: "https://www.aisafetybook.com/virtual-course", note: "Twelve weeks online, from CAIS." }
    ] },
    read: { name: "Watch and read", items: [
      { name: "AI Just Crossed the Terrifying Line. Now What?", logo: R + "kurzgesagt.png", href: "https://www.youtube.com/watch?v=ujkD4SxPKOI", note: "Kurzgesagt on the July 2026 sandbox escape." },
      { name: "What Failure Looks Like", logo: R + "lesswrong.png", href: "https://www.lesswrong.com/posts/HBxe6wdjxK239zajf/what-failure-looks-like", note: "Paul Christiano's short essay." },
      { name: "AI 2027", href: "https://ai-2027.com", note: "A month-by-month scenario." },
      { name: "Gradual Disempowerment", href: "https://gradual-disempowerment.ai", note: "Co-written by U of T's David Duvenaud." }
    ] },
    uoft: { name: "At U of T", items: [
      { name: "Mathematics for AI Safety (MAT1510)", logo: R + "fields.png", href: "https://www2.fields.utoronto.ca/activities/26-27/SGC-safety", note: "A graduate course at the Fields Institute." },
      { name: "Roger Grosse", photo: P + "grosse.webp", href: "https://www.cs.toronto.edu/~rgrosse/", note: "Computer Science" },
      { name: "David Duvenaud", photo: P + "duvenaud.webp", href: "https://www.cs.toronto.edu/~duvenaud/", note: "Computer Science" },
      { name: "Zhijing Jin", photo: P + "jin.webp", href: "https://zhijing-jin.com/", note: "Computer Science" },
      { name: "Yevgeny Liokumovich", photo: P + "liokumovich.webp", href: "https://www.math.toronto.edu/ylio/", note: "Mathematics" }
    ] },
    toronto: { name: "In Toronto", items: [
      { name: "TAISI events", shard: SH + "shard-3.svg", href: TAISI_LUMA, note: "Our talks, coworking and socials, on Luma." },
      TL_EVENTS,
      { name: "Trajectory Labs", logo: R + "trajectory.png", href: "https://www.trajectorylabs.org/", note: "The coworking space where our fellowships meet. Independent of U of T." }
    ] },
    taisi: { name: "With TAISI", items: [APPLY] },
    research: { name: "Research programs", items: [
      SPAR, AISC,   // part-time and open to students, so they lead the list
      { name: "MATS", logo: L + "mats-icon.png", href: "https://www.matsprogram.org/", note: "Twelve weeks, full time, Berkeley or London." },
      { name: "Anthropic Fellows Program", logo: R + "anthropic.png", href: "https://alignment.anthropic.com/2025/anthropic-fellows-program-2026/", note: "Four months of paid empirical research." },
      { name: "ERA Fellowship", logo: R + "era.png", href: "https://erafellowship.org/fellowship", note: "Ten weeks in Cambridge, UK." },
      { name: "LASR Labs", logo: R + "lasr.png", href: "https://www.lasrlabs.org/", note: "Thirteen weeks in London, for ML engineers." },
      { name: "Pivotal Research Fellowship", logo: L + "pivotal.png", href: "https://www.pivotal-research.org/fellowship", note: "Fifteen weeks in London." },
      { name: "MARS", logo: R + "mars.png", href: "https://www.caish.org/mars", note: "Part-time team research for students." }
    ] },
    bootcamps: { name: "Engineering bootcamps", items: [
      { name: "ARENA", logo: R + "arena.png", href: "https://www.arena.education/", note: "Four to five weeks of ML engineering, London." },
      { name: "CAMBRIA", logo: R + "cbai.png", href: "https://cbai.ai/cambria", note: "Three weeks of ARENA, Cambridge, MA." },
      { name: "ML4Good", href: "https://www.ml4good.org/", note: "Free eight-day residential bootcamps." }
    ] },
    hackathons: { name: "Hackathons and workshops", items: [
      { name: "Apart Research Sprints", logo: R + "apart.png", href: "https://www.apartresearch.com/sprints", note: "Weekend research hackathons." },
      { name: "Global Challenges Project", logo: R + "gcp.svg", href: "https://www.globalchallengesproject.org/", note: "Free three-day workshops for students." }
    ] },
    policy: { name: "Policy fellowships", items: [
      { name: "GovAI Fellowships", logo: L + "govai-icon.jpg", href: "https://www.governance.ai/opportunities", note: "Three months, London or Washington." },
      { name: "IAPS AI Policy Fellowship", logo: L + "iaps.png", href: "https://www.iaps.ai/fellowship", note: "About three months, paid." },
      { name: "Talos Fellowship", logo: R + "talos.png", href: "https://www.talosnetwork.org/talos-fellowship", note: "European AI governance." },
      { name: "Tarbell Fellowship", logo: L + "tarbell.svg", href: "https://www.tarbellcenter.org/fellowship", note: "A year as an AI reporter." },
      { name: "Vista Institute for AI Policy", logo: R + "vista.png", href: "https://vistainstituteai.org/", note: "AI and the law, for law students." },
      { name: "CAIS AI and Society Fellowship", logo: L + "cais-icon.png", href: "https://safe.ai/fellowship", note: "For economics, law and IR scholars." }
    ] },
    discuss: { name: "Read and discuss", items: [
      { name: "AI Alignment Forum", href: "https://www.alignmentforum.org/", note: "Technical alignment research." },
      { name: "LessWrong", logo: R + "lesswrong.png", href: "https://www.lesswrong.com/", note: "Where much of the field's writing starts." },
      { name: "Import AI", logo: R + "importai.png", href: "https://importai.substack.com/", note: "Weekly roundup of AI research." },
      { name: "Transformer", logo: R + "transformer.png", href: "https://www.transformernews.ai/", note: "Weekly AI policy and safety news." }
    ] },
    experienced: { name: "Programs for experienced people", items: [
      { name: "Astra Fellowship", logo: L + "constellation.png", href: "https://constellation.org/programs/astra", note: "Five months, fully funded, Berkeley." },
      { name: "PIBBSS Fellowship", logo: R + "pibbss.png", href: "https://princint.ai/programs/fellowship/", note: "For people moving in from other fields." },
      { name: "Generator Residency", logo: R + "generator.svg", href: "https://generatorresidency.org/", note: "Twelve weeks to launch a project." },
      { name: "BlueDot Impact", logo: L + "bluedot.png", href: "https://bluedot.org/courses", note: "Free part-time online courses." }
    ] },
    career: { name: "Career support", items: [
      { name: "80,000 Hours advising", logo: L + "80k-icon.png", href: "https://80000hours.org/speak-with-us/", note: "A free call about working on AI risk." },
      { name: "Successif", logo: R + "successif.png", href: "https://www.successif.org/", note: "Advising for experienced professionals." }
    ] },
    community: { name: "Stay in touch", items: [
      { name: "Join our Discord", logo: L + "discord.svg", href: "/api/discord", note: "Talk with the TAISI community." },
      { name: "Follow us on Instagram", logo: L + "instagram.svg", href: "https://www.instagram.com/taisi.uoft", note: "Events and photos from TAISI." }
    ] }
  };
  G.colleagues = { name: "Colleagues working on AI safety", items: G.uoft.items.slice(1).concat(G.uoft.items[0]) };

  // ---- the paths ---------------------------------------------------------
  var TREE = {
    q: "Who are you?",
    options: [
      { id: "student", label: "A student", hint: "Undergraduate or graduate", wash: "lilac", next: {
        q: "Where are you starting?",
        options: [
          { id: "new", label: "New to AI safety", hint: "Start with the basics", wash: "lilac", result: "new" },
          { id: "deeper", label: "Ready to go deeper", hint: "Research, programs and people at U of T", wash: "plum", result: "deeper" }
        ]
      } },
      { id: "faculty", label: "U of T faculty", hint: "A conversation with our execs", wash: "gold", result: "faculty" },
      { id: "pro", label: "A working professional", hint: "Moving into AI safety, in Toronto or remotely", wash: "rose", result: "pro" }
    ]
  };

  // featured: the card at the top; after: the card at the bottom
  var RESULTS = {
    "new": { title: "Start here", featured: INTRO, after: BOOK,
      groups: [G.courses, G.read, G.community] },
    "deeper": { title: "Going deeper", featured: [MENTOR_INTEREST, APPLY], after: BOOK,
      groups: [G.uoft, G.toronto, G.taisi, G.research, G.bootcamps, G.hackathons, G.policy, G.discuss, G.community] },
    "faculty": { title: "Work with TAISI", featured: BOOK_FACULTY,
      groups: [G.colleagues] },
    "pro": { title: "For working professionals", featured: TL_EVENTS,
      groups: [G.experienced, G.career, G.community] }
  };

  // ---- helpers -------------------------------------------------------------
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function walk(path) {                     // -> { nodes: [tree, ...], picks: [option, ...] }
    var node = TREE, nodes = [TREE], picks = [];
    for (var i = 0; i < path.length; i++) {
      var opt = (node.options || []).filter(function (o) { return o.id === path[i]; })[0];
      if (!opt) break;
      picks.push(opt);
      if (opt.next) { node = opt.next; nodes.push(node); } else break;
    }
    return { nodes: nodes, picks: picks };
  }
  function pathFromHash() { return location.hash.replace(/^#/, "").split("/").filter(Boolean); }
  function isExternal(href) { return /^https?:/.test(href || "") || /^\/api\//.test(href || ""); }

  function thumb(it) {
    if (it.shard) return '<img class="f-thumb shard" src="' + esc(it.shard) + '" alt="" loading="lazy">';
    if (it.photo) return '<img class="f-thumb round" src="' + esc(it.photo) + '" alt="" loading="lazy">';
    if (it.logo) return '<span class="f-thumb"><img src="' + esc(it.logo) + '" alt="" loading="lazy"></span>';
    var isPerson = /^(Computer Science|Mathematics)$/.test(it.note || "");   // faculty get two initials
    var initials = isPerson ? it.name.split(" ").map(function (w) { return w.charAt(0); }).slice(0, 2).join("") : it.name.charAt(0);
    return '<span class="f-thumb letter" aria-hidden="true">' + esc(initials) + "</span>";
  }
  // `status` (e.g. "Applications open in January") leads the note in purple.
  function note(it) {
    if (!it.note && !it.status) return "";
    return '<span class="f-note">' + (it.status ? '<span class="soon-text">' + esc(it.status) + '</span> &middot; ' : "") + esc(it.note || "") + "</span>";
  }
  // `cta` (e.g. "Express interest", "Apply") shows as a link line under the note; the whole tile is the link.
  function cta(it) {
    return it.cta ? '<span class="f-cta">' + esc(it.cta) + ' <span aria-hidden="true">&rarr;</span></span>' : "";
  }
  function item(it) {
    var inner = thumb(it) + '<span class="f-text"><span class="f-name">' + esc(it.name) + "</span>" + note(it) + cta(it) + "</span>";
    return it.href
      ? '<a class="f-item" href="' + esc(it.href) + '"' + (isExternal(it.href) ? ' target="_blank" rel="noopener"' : "") + ">" + inner + "</a>"
      : '<div class="f-item is-muted">' + inner + "</div>";
  }
  function featured(it, extra) {
    return '<a class="f-featured' + (extra ? " " + extra : "") + '" href="' + esc(it.href) + '"' + (isExternal(it.href) ? ' target="_blank" rel="noopener"' : "") + ">" +
      '<img class="f-featured-wash" src="/assets/wash-' + (it.wash || "rose") + '.svg" alt="">' + thumb(it) +
      '<span class="f-text"><span class="f-name">' + esc(it.name) + "</span>" + note(it) + cta(it) + "</span>" +
      (it.cta ? "" : '<span class="f-go" aria-hidden="true">&rarr;</span>') + "</a>";
  }
  function group(g) {
    return '<section class="f-group"><h3>' + esc(g.name) + '</h3><div class="f-items">' + g.items.map(item).join("") + "</div></section>";
  }

  // ---- rendering -------------------------------------------------------------
  var trail = root.querySelector(".f-trail");
  var stage = root.querySelector(".f-stage");

  // A quiet breadcrumb: Resources › A student › New to AI safety. Each earlier step is a link back.
  function renderTrail(picks) {
    if (!picks.length) { trail.hidden = true; trail.innerHTML = ""; return; }
    var crumbs = [{ label: "Resources", to: "" }].concat(picks.map(function (p, i) {
      return { label: p.label, to: picks.slice(0, i + 1).map(function (x) { return x.id; }).join("/") };
    }));
    trail.innerHTML = '<ol class="f-crumbs">' + crumbs.map(function (c, i) {
      var last = i === crumbs.length - 1;
      return "<li>" + (last
        ? '<span aria-current="step" data-crumb="' + (i - 1) + '">' + esc(c.label) + "</span>"
        : '<button type="button" data-to="' + c.to + '" data-crumb="' + (i - 1) + '">' + esc(c.label) + "</button>") + "</li>";
    }).join("") + "</ol>";
    trail.hidden = false;
  }

  function renderStage(w) {
    var last = w.picks[w.picks.length - 1];
    if (last && last.result) {
      var r = RESULTS[last.result];
      stage.innerHTML = '<div class="f-result">' +
        '<h2 class="f-q">' + esc(r.title) + "</h2>" +
        [].concat(r.featured || []).map(function (f) { return featured(f); }).join("") +
        r.groups.map(group).join("") +
        (r.after ? featured(r.after, "is-after") : "") +
        "</div>";
    } else {
      var node = w.nodes[w.nodes.length - 1];
      stage.innerHTML =
        '<h2 class="f-q">' + esc(node.q) + "</h2>" +
        '<div class="f-options">' + node.options.map(function (o) {
          return '<button class="f-option" data-id="' + o.id + '">' +
            '<img class="f-wash" src="/assets/wash-' + o.wash + '.svg" alt="">' +
            '<span class="f-label">' + esc(o.label) + '</span><span class="f-hint">' + esc(o.hint) + "</span>" +
            '<span class="f-arrow" aria-hidden="true">&rarr;</span></button>';
        }).join("") + "</div>" +
        (w.picks.length ? "" : '<a class="f-skip" href="#all-resources">Or skip to all resources <span aria-hidden="true">&darr;</span></a>');
    }
  }

  function render(path) {
    var w = walk(path);
    renderTrail(w.picks);
    renderStage(w);
  }

  // The chosen tile lifts, floats up to its place in the breadcrumb and settles into the text there.
  var busyUntil = 0;   // the next options appear under the cursor, so ignore clicks until the move settles
  function choose(btn) {
    if (Date.now() < busyUntil) return;
    busyUntil = Date.now() + 700;
    var path = pathFromHash().concat(btn.dataset.id);
    if (reduce) { history.pushState(null, "", "#" + path.join("/")); render(path); return; }
    var from = btn.getBoundingClientRect();
    var ghost = btn.cloneNode(true);
    ghost.classList.add("f-ghost");
    ghost.style.cssText = "position:fixed;left:" + from.left + "px;top:" + from.top + "px;width:" + from.width + "px;height:" + from.height + "px;margin:0;z-index:40;pointer-events:none";
    document.body.appendChild(ghost);
    stage.querySelectorAll(".f-option").forEach(function (o) {
      if (o !== btn) o.animate([{ opacity: 1 }, { opacity: 0, transform: "translateY(10px) scale(.98)" }], { duration: 220, fill: "forwards" });
    });
    btn.style.visibility = "hidden";

    history.pushState(null, "", "#" + path.join("/"));
    render(path);
    var crumb = trail.querySelector('[data-crumb="' + (path.length - 1) + '"]');
    var to = crumb.getBoundingClientRect();
    crumb.style.opacity = "0";
    var anim = ghost.animate([
      { left: from.left + "px", top: from.top + "px", width: from.width + "px", height: from.height + "px", opacity: 1, borderRadius: "14px" },
      { left: to.left + "px", top: (to.top - 4) + "px", width: Math.max(to.width, 40) + "px", height: (to.height + 8) + "px", opacity: 0, borderRadius: "8px" }
    ], { duration: 520, easing: "cubic-bezier(.65,0,.25,1)", fill: "forwards" });
    ghost.querySelectorAll(".f-hint, .f-arrow, .f-wash").forEach(function (el) {
      el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, fill: "forwards" });
    });
    crumb.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 260, delay: 340, fill: "forwards" });
    anim.onfinish = function () { crumb.style.opacity = ""; ghost.remove(); };
  }

  root.addEventListener("click", function (e) {
    var opt = e.target.closest(".f-option");
    if (opt) { choose(opt); return; }
    var back = e.target.closest(".f-crumbs button");
    if (back) {
      var to = back.dataset.to;
      history.pushState(null, "", to ? "#" + to : location.pathname);
      render(to ? to.split("/") : []);
      root.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    }
  });
  window.addEventListener("popstate", function () { if (location.hash !== "#all-resources") render(pathFromHash()); });
  render(location.hash === "#all-resources" ? [] : pathFromHash());

  // ---- every resource in one list, below the guide ----------------------------
  var all = document.querySelector("[data-all-resources]");
  if (all) {
    var seen = {};
    var list = [
      { name: "Get involved with TAISI", items: [INTRO, MENTOR_INTEREST, APPLY, BOOK] },
      G.courses, G.read, G.uoft, G.toronto, G.research, G.bootcamps, G.hackathons, G.policy,
      G.experienced, G.career, G.discuss, G.community
    ].map(function (g) {
      return { name: g.name, items: g.items.filter(function (it) { var k = it.href || it.name; if (seen[k]) return false; seen[k] = true; return true; }) };
    }).filter(function (g) { return g.items.length; });
    all.innerHTML = list.map(group).join("");
  }
})();
