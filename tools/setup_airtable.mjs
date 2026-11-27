// One-time Airtable setup for the site's forms. Safe to re-run: it only adds what is missing.
//   node tools/setup_airtable.mjs            -> make the changes
//   node tools/setup_airtable.mjs --dry-run  -> only print what it would do
// Needs AIRTABLE_PAT with schema.bases:read/write on the F26 Intro base, from the environment or
// .env.local. It never deletes or renames anything.
//
// What the forms need in the F26 Intro base:
//   "Expression of Interest" (tblwFurDfscp9Z8AL), already used by /interest:
//     + "Research area", "Mentee or mentor" and "What they have worked on", for /interest/mentorship.
//     The Program option "Research mentorship" is created by the first mentorship signup
//     (the API sends typecast), because Airtable's API cannot add select options to a field.
//   "Membership Applications" (new), for /membership.
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { BASE_ID } from "../api/_airtable.js";
import { QUESTIONS } from "../api/membership.js";

const DRY = process.argv.includes("--dry-run");
const EOI_TABLE = "tblwFurDfscp9Z8AL";
const choices = (names) => ({ choices: names.map((name) => ({ name })) });

// Fields /interest/mentorship adds to the Expression of Interest table.
const EOI_FIELDS = [
  { name: "Research area", type: "multipleSelects", options: choices(["Technical AI safety", "Governance", "Philosophy"]) },
  { name: "Mentee or mentor", type: "singleSelect", options: choices(["Mentee", "Mentor"]) },
  { name: "What they have worked on", type: "multilineText" },
];

const MEMBERSHIP = {
  name: "Membership Applications",
  description: "Applications from taisi.ca/membership (site v2, api/membership.js). U of T students only.",
  fields: [   // the first field is the primary field
    { name: "Name", type: "singleLineText" },
    { name: "Email", type: "email" },
    { name: "Year", type: "singleLineText" },
    ...Object.values(QUESTIONS).map((name) => ({ name, type: "multilineText" })),
    { name: "Source", type: "singleLineText" },
    { name: "Status", type: "singleSelect", options: choices(["New", "Accepted", "Declined"]) },
    { name: "Submission time", type: "dateTime",
      options: { timeZone: "America/Toronto", dateFormat: { name: "iso" }, timeFormat: { name: "24hour" } } },
  ],
};
// Fields renamed since the table was first made: old name -> new name (renamed in place, data kept).
const MEMBERSHIP_RENAMES = {
  Background: QUESTIONS.background,
  "What is one thing you read recently that influenced your thinking on AI safety?": QUESTIONS.reading,
};

async function token() {
  if (process.env.AIRTABLE_PAT) return process.env.AIRTABLE_PAT;
  try {
    const text = await readFile(fileURLToPath(new URL("../.env.local", import.meta.url)), "utf8");
    const m = text.match(/^\s*(?:export\s+)?AIRTABLE_PAT\s*=\s*['"]?([^'"\s]+)/m);
    if (m) return m[1];
  } catch {}
  throw new Error("AIRTABLE_PAT is not set (environment or .env.local)");
}

async function api(pat, method, path, body) {
  const r = await fetch(`https://api.airtable.com/v0/meta/bases/${BASE_ID}${path}`, {
    method, headers: { Authorization: `Bearer ${pat}`, "Content-Type": "application/json" },
    body: body && JSON.stringify(body),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`${method} ${path}: ${r.status} ${JSON.stringify(data)}`);
  return data;
}

const pat = await token();
const { tables } = await api(pat, "GET", "/tables");

const eoi = tables.find((t) => t.id === EOI_TABLE);
if (!eoi) throw new Error(`Table ${EOI_TABLE} not found in ${BASE_ID}`);
console.log(`Found "${eoi.name}" (${eoi.id}) with fields: ${eoi.fields.map((f) => f.name).join(", ")}`);
const program = eoi.fields.find((f) => f.name === "Program");
const hasMentorship = program?.options?.choices?.some((c) => c.name === "Research mentorship");
console.log(`  Program option "Research mentorship": ${hasMentorship ? "present" : "missing; the first mentorship signup creates it"}`);
for (const f of EOI_FIELDS) {
  if (eoi.fields.some((x) => x.name === f.name)) console.log(`  "${f.name}": present`);
  else if (DRY) console.log(`  would add "${f.name}"`);
  else { await api(pat, "POST", `/tables/${EOI_TABLE}/fields`, f); console.log(`  added "${f.name}"`); }
}

const mem = tables.find((t) => t.name === MEMBERSHIP.name);
if (mem) {
  for (const [from, to] of Object.entries(MEMBERSHIP_RENAMES)) {
    const f = mem.fields.find((x) => x.name === from);
    if (!f || mem.fields.some((x) => x.name === to)) continue;
    if (DRY) console.log(`  would rename "${from}" to "${to}"`);
    else { await api(pat, "PATCH", `/tables/${mem.id}/fields/${f.id}`, { name: to }); f.name = to; console.log(`  renamed "${from}" to "${to}"`); }
  }
  const missing = MEMBERSHIP.fields.filter((f) => !mem.fields.some((x) => x.name === f.name));
  console.log(`Found "${mem.name}" (${mem.id})${missing.length ? "" : ", all fields present"}`);
  for (const f of missing) {
    if (DRY) console.log(`  would add "${f.name}"`);
    else { await api(pat, "POST", `/tables/${mem.id}/fields`, f); console.log(`  added "${f.name}"`); }
  }
} else if (DRY) console.log(`would create "${MEMBERSHIP.name}" with ${MEMBERSHIP.fields.length} fields`);
else { const t = await api(pat, "POST", "/tables", MEMBERSHIP); console.log(`created "${t.name}" (${t.id})`); }
