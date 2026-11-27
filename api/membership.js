// POST /api/membership -> one row in the "Membership Applications" table of the F26 Intro base
// (created by tools/setup_airtable.mjs). Used by /membership. Membership is for U of T students; the page
// says so and points everyone else to the execs.
import { checkBasics, createRecord, str, MAX_LONG } from "./_airtable.js";

const TABLE = "Membership Applications";

// Form field -> Airtable field. The Airtable names are the questions as asked on the form.
// Keep in step with membership/index.html and MEMBERSHIP in tools/setup_airtable.mjs.
export const QUESTIONS = {
  background: "Previous AI safety background",
  risks: "What AI risks are you most concerned about, and why?",
  future: "Where do you see yourself in 2 years? In 5 years?",
  reading: "What is one thing you read recently that influenced your thinking on AI safety? What was it?",
};

export default async function handler(req, res) {
  if (checkBasics(req, res)) return;
  const b = req.body;
  const fields = { Name: str(b.name), Email: str(b.email), Year: str(b.year) };
  if (!fields.Year) return res.status(400).json({ error: "Year of study is required" });
  for (const [key, field] of Object.entries(QUESTIONS)) {
    fields[field] = str(b[key], MAX_LONG);
    if (!fields[field]) return res.status(400).json({ error: `Please answer: ${field}` });
  }
  Object.assign(fields, { Source: str(b.source), Status: "New", "Submission time": new Date().toISOString() });
  return createRecord(res, TABLE, fields, "membership");
}
