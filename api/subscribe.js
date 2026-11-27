// POST /api/subscribe -> add an email to the TAISI mailing list (same Airtable table as the old site's /api/subscribe).
// Needs AIRTABLE_PAT (Vercel env, or .env.local locally). The old site also sent a welcome email; not ported yet.
import { EMAIL_RE, str } from "./_airtable.js";

const BASE_ID = "appLQunyWZ3t3kx5o";   // "mailing list" base
const TABLE_ID = "tblH7kI5rrYwne7a9";  // fields: email, Submission time, Source

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const email = str(req.body?.email);
  if (!EMAIL_RE.test(email)) return res.status(400).json({ error: "A valid email is required" });
  if (!process.env.AIRTABLE_PAT) {
    console.error("subscribe: AIRTABLE_PAT is not set");
    return res.status(500).json({ error: "Failed to save email" });
  }
  const fields = { email, "Submission time": new Date().toISOString() };
  const source = str(req.body?.source);   // which page's form, e.g. "website-home"
  if (source) fields.Source = source;
  try {
    const r = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.AIRTABLE_PAT}`, "Content-Type": "application/json" },
      body: JSON.stringify({ records: [{ fields }] }),
    });
    if (!r.ok) {
      console.error("Airtable subscribe error:", await r.text());
      return res.status(500).json({ error: "Failed to save email" });
    }
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("subscribe error:", err);
    res.status(500).json({ error: "Failed to save email" });
  }
}
