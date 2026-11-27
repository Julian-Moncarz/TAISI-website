// Shared by the form functions in api/. Files starting with "_" are helpers, not routes (Vercel skips
// them, and tools/dev.mjs refuses them too).
//
// Every form writes to the F26 Intro base. The tables and fields are created by
// tools/setup_airtable.mjs; run it once with AIRTABLE_PAT set if a form says a field is missing.
export const BASE_ID = "app16GwTflH97nQy5";

export const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;   // same check the browser runs
export const MAX = 200;
export const MAX_LONG = 4000;

export const str = (v, max = MAX) => (typeof v === "string" ? v.trim().slice(0, max) : "");
export const list = (v, allowed) => (Array.isArray(v) ? [...new Set(v.filter((x) => allowed.includes(x)))] : []);

// Validate the name/email/honeypot every form shares. Returns an error response, or null to continue.
export function checkBasics(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  if (!req.body || typeof req.body !== "object") return res.status(400).json({ error: "Expected JSON" });
  // Honeypot: hidden from people, so only a bot fills it in. Report success, which tells a scraper nothing.
  if (str(req.body.company)) return res.status(200).json({ success: true });
  if (!str(req.body.name)) return res.status(400).json({ error: "Name is required" });
  if (!EMAIL_RE.test(str(req.body.email))) return res.status(400).json({ error: "A valid email is required" });
  return null;
}

// Create one record. Empty values are dropped so optional fields stay blank in Airtable.
// typecast lets a new single-select value (e.g. a new Program) create its option instead of failing.
export async function createRecord(res, table, fields, label) {
  for (const [k, v] of Object.entries(fields)) if (v === "" || (Array.isArray(v) && !v.length)) delete fields[k];
  if (!process.env.AIRTABLE_PAT) {
    console.error(`${label}: AIRTABLE_PAT is not set`);
    return res.status(500).json({ error: "Failed to save your details" });
  }
  try {
    const r = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(table)}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.AIRTABLE_PAT}`, "Content-Type": "application/json" },
      body: JSON.stringify({ records: [{ fields }], typecast: true }),
    });
    if (!r.ok) {
      console.error(`Airtable ${label} error:`, await r.text());
      return res.status(500).json({ error: "Failed to save your details" });
    }
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(`${label} submit error:`, err);
    return res.status(500).json({ error: "Failed to save your details" });
  }
}
