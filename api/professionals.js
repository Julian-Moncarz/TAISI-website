// POST /api/professionals -> one row in the "Working Professionals EOI" table of the Summer Intensives base.
// Used by /interest/professionals. Same table and field names as the old site's working-professionals form.
import { checkBasics, createRecord, str } from "./_airtable.js";

const BASE = "appVfG77MoQbG3bgi";       // Summer Intensives
const TABLE = "tblvuakrOt7JSZPdT";      // Working Professionals EOI

export default async function handler(req, res) {
  if (checkBasics(req, res)) return;
  const b = req.body;
  let link = str(b.link, 500);
  if (!link) return res.status(400).json({ error: "LinkedIn or portfolio is required" });
  if (!/^https?:\/\//i.test(link)) link = "https://" + link;   // the field is a URL field
  return createRecord(res, TABLE, {
    Name: str(b.name),
    Email: str(b.email),
    "LinkedIn or Portfolio": link,
  }, "professionals", BASE);
}
