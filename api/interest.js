// POST /api/interest -> one row in the "Expression of Interest" table of the F26 Intro base.
// Used by /interest (fellowship) and /interest/mentorship (research mentorship). The fellowship
// fields match the Next.js site's /api/interest (Julian's PR #15), so both sites write alike.
import { checkBasics, createRecord, list, str, MAX_LONG } from "./_airtable.js";

const TABLE_ID = "tblwFurDfscp9Z8AL";

// The Program field. "Intensive" and "Both" are kept so older rows stay valid (the Intensive was
// cut in September 2026). "Research mentorship" was added for the mentorship interest form.
const PROGRAMS = ["Fellowship", "Intensive", "Both", "Research mentorship"];
const AREAS = ["Technical AI safety", "Governance", "Philosophy"];
const ROLES = ["Mentee", "Mentor"];   // mentorship only; mentors also say what they have worked on

export default async function handler(req, res) {
  if (checkBasics(req, res)) return;
  const b = req.body;
  const program = str(b.program) || "Fellowship";
  if (!PROGRAMS.includes(program)) return res.status(400).json({ error: "Choose which program you want to hear about" });
  const mentorship = program === "Research mentorship";
  const role = mentorship ? str(b.role) : "";
  const work = role === "Mentor" ? str(b.work, MAX_LONG) : "";
  if (mentorship && !ROLES.includes(role)) return res.status(400).json({ error: "Please answer: Do you want to be a mentee or a mentor?" });
  if (role === "Mentor" && !work) return res.status(400).json({ error: "What have you worked on? is required" });

  return createRecord(res, TABLE_ID, {
    Name: str(b.name),
    Email: str(b.email),
    Program: program,
    Affiliation: str(b.affiliation),
    Year: str(b.year),
    "Research area": mentorship ? list(b.areas, AREAS) : [],
    "Mentee or mentor": role,
    "What they have worked on": work,
    Source: str(b.source),              // which button sent them here (?from=...)
    "Submission time": new Date().toISOString(),
  }, "interest");
}
