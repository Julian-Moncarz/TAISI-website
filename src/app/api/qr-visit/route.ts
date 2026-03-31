import { NextRequest, NextResponse } from "next/server";

const PAT = process.env.AIRTABLE_PAT!;
const BASE_ID = process.env.AIRTABLE_BASE_ID!;
const TABLE_NAME = "QR Scans";

export async function POST(req: NextRequest) {
  try {
    const { location } = await req.json();

    if (!location || typeof location !== "string") {
      return NextResponse.json({ error: "Location is required" }, { status: 400 });
    }

    const res = await fetch(
      `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE_NAME)}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PAT}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          records: [
            {
              fields: {
                Location: location,
                Timestamp: new Date().toISOString(),
              },
            },
          ],
        }),
      }
    );

    if (!res.ok) {
      const error = await res.text();
      console.error("Airtable QR scan error:", error);
      return NextResponse.json({ error: "Failed to record scan" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("QR visit error:", e);
    return NextResponse.json({ error: "Failed to record scan" }, { status: 500 });
  }
}
