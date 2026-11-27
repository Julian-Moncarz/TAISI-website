/* TAISI site behaviour: mobile nav, the animated mark, the Luma events feed, the mailing-list form. */
(function () {
  "use strict";

  // ---- header ---------------------------------------------------------
  // Social links live here so they are set in one place. Fill these in to switch them on.
  var SOCIAL = {
    instagram: "https://www.instagram.com/taisi.uoft",
    discord: "/api/discord"
  };
  document.querySelectorAll("[data-social]").forEach(function (a) {
    var url = SOCIAL[a.getAttribute("data-social")];
    if (url) a.href = url;
    else { a.removeAttribute("target"); a.setAttribute("aria-disabled", "true"); a.title = "Link coming soon"; }
  });

  var header = document.querySelector(".site-header");
  if (header) {
    var btn = header.querySelector(".menu-btn");
    if (btn) btn.addEventListener("click", function () {
      var open = header.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.setAttribute("aria-label", open ? "Close menu" : "Menu");
      document.documentElement.classList.toggle("menu-open", open);
    });
    header.querySelectorAll(".nav-links a").forEach(function (a) {
      a.addEventListener("click", function () {
        header.classList.remove("open");
        document.documentElement.classList.remove("menu-open");
        if (btn) btn.setAttribute("aria-expanded", "false");
      });
    });
    var onScroll = function () { header.classList.toggle("scrolled", window.scrollY > 8); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // ---- the mark (geometry from the TAISI logo files, viewBox 0 0 1000 988) ----
  var NS = "http://www.w3.org/2000/svg";
  var SHARDS = [
    ["sR", "505.1,0 1000,0 505.1,977.9"], ["f1", "0,0 220.9,0 68.3,135.0"], ["f2", "87.9,131.3 228.5,6.9 315.5,88.7"],
    ["f3", "389.0,0 494.9,0 494.9,231.8"], ["f4", "236.0,0 377.8,0 484.6,233.7 329.8,88.2"], ["f5", "80.5,143.1 321.5,98.0 335.2,432.0"],
    ["f6", "331.9,104.2 493.3,255.9 346.7,461.6 346.0,445.9"], ["f7", "205.8,406.7 79.9,157.8 335.9,448.2 336.7,468.5"],
    ["f8", "494.9,271.1 494.9,543.2 349.9,474.7"], ["f9", "361.7,714.7 213.3,421.5 340.0,481.3 492.0,553.0"], ["f10", "494.9,977.9 366.7,724.7 494.9,565.7"]
  ];
  var SEAMS = [
    [228.6, 0, 52.7, 155.6], [228.6, 0, 326.3, 91.9], [326.3, 91.9, 500, 255.2], [326.3, 91.9, 47.1, 144.1], [326.3, 91.9, 340.9, 446.1],
    [70.7, 139.7, 340.9, 446.1], [500, 255.2, 373.4, -21.8], [500, 255.2, 342.2, 476.7], [500, 255.2, 500, -24], [500, 255.2, 500, 551.2],
    [340.9, 446.1, 342.2, 476.7], [342.2, 476.7, 187.9, 403.9], [342.2, 476.7, 500, 551.2], [500, 551.2, 349.2, 738.4], [500, 551.2, 500, 1012]
  ];
  var uid = 0;
  function el(name, attrs, kids) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    (kids || []).forEach(function (c) { if (c) e.appendChild(c); });
    return e;
  }
  function lines(cls) {
    return SEAMS.map(function (s, i) {
      if (cls === "spark" && i === 10) return null;
      return el("line", { "class": cls + " g" + (i + 1), x1: s[0], y1: s[1], x2: s[2], y2: s[3] });
    });
  }
  function buildMark(animate) {
    var id = "tsm" + (++uid);
    var tri = "M0 0H1000L500 988Z";
    var maskD = SEAMS.map(function (s) { return "M" + s[0] + " " + s[1] + "L" + s[2] + " " + s[3]; }).join("");
    var defs = el("defs", {}, [
      el("clipPath", { id: id + "c" }, [el("path", { d: tri })]),
      el("mask", { id: id + "m", maskUnits: "userSpaceOnUse", x: -100, y: -100, width: 1200, height: 1200 },
        [el("path", { d: maskD, fill: "none", stroke: "#fff", "stroke-width": 11, "stroke-linecap": "round" })]),
      el("linearGradient", { id: id + "g", x1: 0, y1: 0, x2: 1, y2: 0 }, [
        el("stop", { offset: 0, "stop-color": "#FFF8E6", "stop-opacity": 0 }),
        el("stop", { offset: 0.5, "stop-color": "#FFF8E6", "stop-opacity": 0.95 }),
        el("stop", { offset: 1, "stop-color": "#FFF8E6", "stop-opacity": 0 })]),
      el("filter", { id: id + "f", filterUnits: "userSpaceOnUse", x: -200, y: -200, width: 1400, height: 1400 }, [
        el("feGaussianBlur", { "in": "SourceAlpha", stdDeviation: 12, result: "blur" }),
        el("feFlood", { "flood-color": "#FFB21F", result: "tint" }),
        el("feComposite", { "in": "tint", in2: "blur", operator: "in", result: "halo" }),
        el("feMerge", {}, [el("feMergeNode", { "in": "halo" }), el("feMergeNode", { "in": "halo" }), el("feMergeNode", { "in": "SourceGraphic" })])])
    ]);
    var kids = [
      defs,
      el("g", {}, SHARDS.map(function (s) { return el("polygon", { "class": "shard " + s[0], points: s[1] }); })),
      el("g", { "clip-path": "url(#" + id + "c)" }, lines("seam"))
    ];
    if (animate) {
      kids.push(el("g", { filter: "url(#" + id + "f)" }, [
        el("g", { "clip-path": "url(#" + id + "c)" }, lines("spark")),
        el("circle", { "class": "burst", cx: 228.6, cy: 6, r: 26 })]));
      kids.push(el("g", { "clip-path": "url(#" + id + "c)" }, [el("g", { mask: "url(#" + id + "m)" }, [
        el("g", { transform: "rotate(20 500 494)" }, [el("rect", { "class": "sheen", fill: "url(#" + id + "g)", x: -900, y: -500, width: 220, height: 2000 })])])]));
    }
    return el("svg", { "class": "ts-mark" + (animate ? " ts-intro" : ""), viewBox: "0 0 1000 988", role: "img", "aria-label": "TAISI logo" }, kids);
  }
  document.querySelectorAll("[data-mark]").forEach(function (host) {
    host.appendChild(buildMark(host.getAttribute("data-mark") === "animate"));
  });

  // ---- events feed (served by /api/events, which reads the public TAISI Luma calendar) ----
  var feed = document.querySelector("[data-events]");
  if (feed) {
    var list = feed.querySelector(".events");
    var tabs = feed.querySelectorAll(".tab");
    // "/#past" opens the events section on the Past tab (linked from Programming)
    var data = null, view = location.hash === "#past" ? "past" : "upcoming";
    if (view === "past") {
      var toFeed = function () { feed.scrollIntoView({ block: "start", behavior: "instant" }); };
      if (document.readyState === "complete") setTimeout(toFeed, 50);
      else window.addEventListener("load", function () { setTimeout(toFeed, 50); });
    }
    var TZ = "America/Toronto";
    var fmt = function (iso, opts) { return new Intl.DateTimeFormat("en-CA", Object.assign({ timeZone: TZ }, opts)).format(new Date(iso)); };
    var esc = function (s) { return String(s || "").replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
    var safeUrl = function (u) { return /^https:\/\/(luma\.com|lu\.ma)\//.test(u || "") ? u : "https://luma.com/taisi"; };
    var safeImg = function (u) { return /^https:\/\/images\.lumacdn\.com\//.test(u || "") ? u : ""; };

    function timeRange(e) {
      var t = fmt(e.start_at, { hour: "numeric", minute: "2-digit" }).replace(/\s?([ap])\.?m\.?/i, " $1m").toLowerCase();
      var wd = fmt(e.start_at, { weekday: "short" });
      return wd + " · " + t;
    }
    function card(e, past) {
      var img = safeImg(e.cover_url);
      return '<a class="event' + (past ? " past" : "") + '" href="' + esc(safeUrl(e.url)) + '" target="_blank" rel="noopener">' +
        '<div class="event-date"><div class="m">' + esc(fmt(e.start_at, { month: "short" })) + '</div><div class="d">' + esc(fmt(e.start_at, { day: "numeric" })) + "</div></div>" +
        "<div><div class=\"event-name\">" + esc(e.name) + '</div><div class="event-meta">' +
        esc(past ? fmt(e.start_at, { month: "long", day: "numeric", year: "numeric" }) : timeRange(e)) +
        (e.location ? " · " + esc(e.location) : "") + "</div></div>" +
        (img ? '<img class="event-cover" src="' + esc(img) + '" alt="" loading="lazy">' : "") + "</a>";
    }
    function render() {
      tabs.forEach(function (t) { t.setAttribute("aria-selected", t.dataset.view === view ? "true" : "false"); });
      if (!data) return;
      var items = view === "upcoming" ? data.upcoming : data.past;
      var PAST_SHOWN = 3;   // past events show the three most recent until "See more" is pressed
      var shown = view === "past" && !pastExpanded ? items.slice(0, PAST_SHOWN) : items;
      list.innerHTML = items.length
        ? shown.map(function (e) { return card(e, view === "past"); }).join("") +
          (shown.length < items.length ? '<button class="events-more" type="button">See ' + (items.length - shown.length) + " more</button>" : "")
        : '<div class="events-empty">' + (view === "upcoming" ? "No upcoming events posted yet. Join the mailing list to hear first." : "No past events to show.") + "</div>";
    }
    var pastExpanded = false;
    list.addEventListener("click", function (e) {
      if (e.target.closest(".events-more")) { pastExpanded = true; render(); }
    });
    tabs.forEach(function (t) { t.addEventListener("click", function () { view = t.dataset.view; pastExpanded = false; render(); }); });
    fetch("/api/events")
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (d) { data = d; render(); })
      .catch(function () {
        list.innerHTML = '<div class="events-note">Events are listed on <a href="https://luma.com/taisi" target="_blank" rel="noopener">luma.com/taisi</a>.</div>';
      });
  }

  // ---- unfolding sections: the section holds on screen while its parts appear one by one ----
  // Each child with data-at="0.3" appears once that share of the section has been scrolled.
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll("[data-unfold]").forEach(function (sec) {
    if (reduceMotion) return;
    sec.classList.add("is-live");
    var parts = sec.querySelectorAll("[data-at]");
    var queued = false;
    function update() {
      queued = false;
      var r = sec.getBoundingClientRect();
      var span = sec.offsetHeight - window.innerHeight;
      var p = span > 0 ? Math.max(0, Math.min(1, -r.top / span)) : 1;
      parts.forEach(function (el) { el.classList.toggle("on", p >= parseFloat(el.dataset.at)); });
    }
    window.addEventListener("scroll", function () { if (!queued) { queued = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener("resize", update);
    update();
  });

  // ---- mailing list ---------------------------------------------------
  document.querySelectorAll("form[data-subscribe]").forEach(function (form) {
    var msg = form.querySelector(".form-msg");
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var email = form.querySelector("input[type=email]").value.trim();
      var button = form.querySelector("button");
      button.disabled = true;
      msg.textContent = "";
      fetch("/api/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: email, source: form.dataset.subscribe }) })
        .then(function (r) { if (!r.ok) throw new Error(r.status); form.innerHTML = '<p class="form-msg">You&rsquo;re on the list.</p>'; })
        .catch(function () { msg.textContent = "That didn't go through. Please try again."; button.disabled = false; });
    });
  });

  // ---- forms that write to Airtable (/interest, /interest/mentorship, /membership) ----------
  // <form data-form="/api/<name>">: every named field is sent as JSON (checkbox groups as arrays),
  // plus `source` from ?from= so each button's signups can be told apart. Hidden inputs carry
  // fixed values such as the program. The API repeats every check, so the two cannot disagree.
  document.querySelectorAll("form[data-form]").forEach(function (form) {
    var EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    var err = form.querySelector(".eoi-error");
    var done = form.parentNode.querySelector(".eoi-done");
    var button = form.querySelector("button[type=submit]");
    var label = button.textContent;
    var source = new URLSearchParams(location.search).get("from") || "website";
    var fail = function (text, el) { err.textContent = text; if (el && el.focus) el.focus(); };

    // Follow-up questions, keyed to a radio answer as "field=value":
    //   data-show-when      the block shows only for that answer; while hidden its fields are disabled, so they aren't sent
    //   data-required-when  the field is required only for that answer (its [data-req-mark] * shows then)
    var matches = function (rule) {
      var parts = rule.split("="), picked = form.querySelector('[name="' + parts[0] + '"]:checked');
      return !!picked && picked.value === parts.slice(1).join("=");
    };
    var shown = form.querySelectorAll("[data-show-when]"), conditional = form.querySelectorAll("[data-required-when]");
    var syncRequired = function () {
      Array.prototype.forEach.call(shown, function (box) {
        var on = matches(box.dataset.showWhen);
        box.hidden = !on;
        box.querySelectorAll("input, textarea, select").forEach(function (el) { el.disabled = !on; });
      });
      Array.prototype.forEach.call(conditional, function (el) {
        el.required = matches(el.dataset.requiredWhen);
        var mark = form.querySelector('label[for="' + el.id + '"] [data-req-mark]');
        if (mark) mark.hidden = !el.required;
      });
    };
    if (shown.length || conditional.length) { form.addEventListener("change", syncRequired); syncRequired(); }

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      err.textContent = "";
      var payload = { source: source };
      Array.prototype.forEach.call(form.elements, function (el) {
        if (!el.name || el.disabled) return;
        if (el.type === "checkbox") { (payload[el.name] = payload[el.name] || []); if (el.checked) payload[el.name].push(el.value); }
        else if (el.type === "radio") { if (el.checked) payload[el.name] = el.value; else if (!(el.name in payload)) payload[el.name] = ""; }
        else payload[el.name] = el.value.trim();
      });
      // Required fields, in page order; a radio group counts once.
      var missing = Array.prototype.find.call(form.querySelectorAll("[required]"), function (el) { return !payload[el.name]; });
      if (missing) {
        var lab = form.querySelector('label[for="' + missing.id + '"]');
        var legend = !lab && missing.closest("fieldset") && missing.closest("fieldset").querySelector("legend");
        var text = (lab || legend) ? (lab || legend).firstChild.textContent.trim() : "";
        return fail(text && !/\?$/.test(text) ? text + " is required" : "Please answer: " + (text || "this question"), missing);
      }
      if (payload.email !== undefined && !EMAIL_RE.test(payload.email)) return fail("Enter a valid email address so we can reach you.", form.elements.email);

      button.disabled = true;
      button.textContent = "Sending...";
      fetch(form.dataset.form, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (d) { if (!r.ok) throw new Error(d.error || ""); }); })
        .then(function () {
          done.querySelectorAll("[data-email]").forEach(function (n) { n.textContent = payload.email; });
          form.hidden = true; done.hidden = false;
          done.scrollIntoView({ block: "center", behavior: "smooth" });
        })
        .catch(function (e) {
          fail(e.message && e.message !== "Failed to save your details" ? e.message : "Something went wrong. Email us at joseph@taisi.ca instead.");
          button.disabled = false; button.textContent = label;
        });
    });
  });
})();
