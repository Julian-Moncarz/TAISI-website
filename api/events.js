// GET /api/events -> { upcoming, past } for the TAISI Luma calendar.
// Runs as a Vercel function in production and inside tools/dev.mjs locally.
//
// Public events come live from the calendar feed. Luma leaves private events out of that feed,
// so the private ones we want on the site are listed by slug below and looked up one by one.
// To add one: copy the slug from its luma.com/<slug> link into PRIVATE_EVENTS.
const CALENDAR = "cal-HuTqV1xFYDLchnP";

const PRIVATE_EVENTS = [
  "mxld5ny3", // Pacing the Frontier of AI + Coworking
  "ztwojsow", // Anthropic AI Strategy Q&A: Gavin Weinberg
  "shy3k2on", // Understanding METR's Anthropic Assessment + Coworking
  "ryln4m8x", // The Measurement Science of AI Control: Goodharting + Coworking
  "l8t7o242", // Understanding the Goodfire Results + Coworking
  "uxqt5g2l", // Characterizing the Reward-Seeker Threat Model (colloquium)
];

// Slugs whose cover image should not appear on the site.
const HIDE_COVER = new Set(["hpgif3fq"]); // AI Collusion Research Sprint

function shape(e = {}) {
  const geo = e.geo_address_info || e.geo_address_json || {};
  return {
    name: e.name,
    start_at: e.start_at,
    end_at: e.end_at,
    url: `https://luma.com/${e.url || ""}`,
    cover_url: HIDE_COVER.has(e.url) ? null : e.cover_url,
    location: geo.address || geo.city || "",
  };
}

async function getJson(url) {
  // Luma throttles requests that carry Node's default user agent, so send an ordinary one.
  const res = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": "Mozilla/5.0 (compatible; taisi-site/1.0; +https://taisi.ca)" },
  });
  if (!res.ok) throw new Error(`Luma ${res.status} for ${url}`);
  return res.json();
}

async function calendar(period) {
  const { entries = [] } = await getJson(
    `https://api.lu.ma/calendar/get-items?calendar_api_id=${CALENDAR}&period=${period}&pagination_limit=50`
  );
  return entries.map((x) => shape(x.event));
}

async function privateEvents() {
  const out = [];
  for (const slug of PRIVATE_EVENTS) {            // one at a time: Luma rate-limits bursts
    try {
      const j = await getJson(`https://api.lu.ma/url?url=${slug}`);
      if (j?.data?.event) out.push(shape(j.data.event));
    } catch (err) {
      console.warn(String(err));
    }
  }
  return out;
}

const TTL = 5 * 60 * 1000;
const cache = (globalThis.__taisiEvents ??= { at: 0, body: null, pending: null });

export async function loadEvents() {
  if (cache.body && Date.now() - cache.at < TTL) return cache.body;
  cache.pending ??= build().finally(() => { cache.pending = null; });
  try {
    const body = await cache.pending;
    Object.assign(cache, { at: Date.now(), body });
    return body;
  } catch (err) {
    if (cache.body) return cache.body;          // serve stale rather than nothing
    throw err;
  }
}

async function build(now = new Date()) {
  const [f, p] = await Promise.allSettled([calendar("future"), calendar("past")]);
  if (f.status === "rejected" && p.status === "rejected") throw f.reason;
  const future = f.status === "fulfilled" ? f.value : [];
  const past = p.status === "fulfilled" ? p.value : [];
  const extra = await privateEvents();
  const seen = new Set();
  const all = [...future, ...past, ...extra].filter((e) => e.start_at && !seen.has(e.url) && seen.add(e.url));
  const cutoff = now.toISOString();
  const upcoming = all.filter((e) => (e.end_at || e.start_at) >= cutoff).sort((a, b) => a.start_at.localeCompare(b.start_at));
  const done = all.filter((e) => (e.end_at || e.start_at) < cutoff).sort((a, b) => b.start_at.localeCompare(a.start_at));
  return { upcoming, past: done };
}

export default async function handler(req, res) {
  try {
    const body = await loadEvents();
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=3600");
    res.status(200).json(body);
  } catch (err) {
    res.status(502).json({ error: String(err) });
  }
}
