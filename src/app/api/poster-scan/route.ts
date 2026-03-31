import { NextRequest, NextResponse } from "next/server";

const PAT = process.env.AIRTABLE_PAT!;
const BASE_ID = process.env.AIRTABLE_BASE_ID!;
const POSTER_SCANS_TABLE = "Poster Scans";

const airtableUrl = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(POSTER_SCANS_TABLE)}`;
const headers = {
  Authorization: `Bearer ${PAT}`,
  "Content-Type": "application/json",
};

// POST = create a new scan record (on page load)
export async function POST(req: NextRequest) {
  try {
    const { location } = await req.json();

    if (!location || typeof location !== "string") {
      return NextResponse.json({ error: "Location is required" }, { status: 400 });
    }

    const res = await fetch(airtableUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        records: [{ fields: { Location: location, "Scanned At": new Date().toISOString() } }],
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error("Airtable poster scan error:", error);
      return NextResponse.json({ error: "Failed to log scan" }, { status: 500 });
    }

    const data = await res.json();
    const recordId = data.records?.[0]?.id;

    return NextResponse.json({ success: true, recordId });
  } catch (e) {
    console.error("Poster scan error:", e);
    return NextResponse.json({ error: "Failed to log scan" }, { status: 500 });
  }
}

// PATCH = update an existing scan record with email
export async function PATCH(req: NextRequest) {
  try {
    const { recordId, email } = await req.json();

    if (!recordId || !email) {
      return NextResponse.json({ error: "recordId and email are required" }, { status: 400 });
    }

    const res = await fetch(airtableUrl, {
      method: "PATCH",
      headers,
      body: JSON.stringify({
        records: [{ id: recordId, fields: { Email: email } }],
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error("Airtable poster scan update error:", error);
      return NextResponse.json({ error: "Failed to update scan" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Poster scan update error:", e);
    return NextResponse.json({ error: "Failed to update scan" }, { status: 500 });
  }
}
