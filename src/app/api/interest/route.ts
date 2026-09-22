import { NextRequest, NextResponse } from "next/server";

const PAT = process.env.AIRTABLE_PAT!;
// Fellowship base -> "Expression of Interest" table. This replaces the
// Airtable-hosted form that used to sit behind the "notify me" buttons: its
// table was deleted, which broke the link everywhere it was printed.
const BASE_ID = "app16GwTflH97nQy5";
const TABLE_ID = "tblwFurDfscp9Z8AL";

const PROGRAMS = ["Fellowship", "Intensive", "Both"] as const;

// Matches the check the form runs, so the two cannot disagree.
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const MAX_NAME = 200;
const MAX_SHORT = 200;

export async function POST(req: NextRequest) {
  try {
    const { name, email, program, affiliation, year, source, company } =
      await req.json();

    // Honeypot: the field is hidden, so only a bot fills it in. Report
    // success rather than an error, which tells a scraper nothing.
    if (typeof company === "string" && company.trim()) {
      return NextResponse.json({ success: true });
    }

    if (typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
      return NextResponse.json(
        { error: "A valid email is required" },
        { status: 400 }
      );
    }
    if (typeof program !== "string" || !PROGRAMS.includes(program as typeof PROGRAMS[number])) {
      return NextResponse.json(
        { error: "Choose which program you want to hear about" },
        { status: 400 }
      );
    }

    const fields: Record<string, string> = {
      Name: name.trim().slice(0, MAX_NAME),
      Email: email.trim(),
      Program: program,
      "Submission time": new Date().toISOString(),
    };

    // Affiliation and year are optional, so an empty one is left off the
    // record rather than written as a blank string.
    if (typeof affiliation === "string" && affiliation.trim()) {
      fields.Affiliation = affiliation.trim().slice(0, MAX_SHORT);
    }
    if (typeof year === "string" && year.trim()) {
      fields.Year = year.trim().slice(0, MAX_SHORT);
    }
    // Which page sent them here, so a run of signups can be traced back to
    // the button that produced it.
    if (typeof source === "string" && source.trim()) {
      fields.Source = source.trim().slice(0, MAX_SHORT);
    }

    const res = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAT}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ records: [{ fields }] }),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error("Airtable interest error:", error);
      return NextResponse.json(
        { error: "Failed to save your details" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Interest submit error:", e);
    return NextResponse.json(
      { error: "Failed to save your details" },
      { status: 500 }
    );
  }
}
