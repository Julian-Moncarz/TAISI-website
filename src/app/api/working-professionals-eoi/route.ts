import { NextRequest, NextResponse } from "next/server";

const PAT = process.env.AIRTABLE_PAT!;
// Summer Intensives base -> "Working Professionals EOI" table
const BASE_ID = "appVfG77MoQbG3bgi";
const TABLE_ID = "tblvuakrOt7JSZPdT";

export async function POST(req: NextRequest) {
  try {
    const { name, email, link, availability } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const fields: Record<string, string | string[]> = {
      Email: email,
    };
    if (typeof name === "string" && name.trim()) fields["Name"] = name.trim();
    if (typeof link === "string" && link.trim()) {
      fields["LinkedIn or Portfolio"] = link.trim();
    }
    if (Array.isArray(availability)) {
      const days = availability.filter(
        (d): d is string => typeof d === "string" && d.trim() !== ""
      );
      if (days.length > 0) fields["Availability"] = days;
    }

    const res = await fetch(
      `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PAT}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ records: [{ fields }] }),
      }
    );

    if (!res.ok) {
      const error = await res.text();
      console.error("Airtable EOI error:", error);
      return NextResponse.json(
        { error: "Failed to submit your interest" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("EOI submit error:", e);
    return NextResponse.json(
      { error: "Failed to submit your interest" },
      { status: 500 }
    );
  }
}
