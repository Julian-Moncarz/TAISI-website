import { NextRequest, NextResponse } from "next/server";

const PAT = process.env.AIRTABLE_PAT!;
// Master Table base -> "Contact us" table
const BASE_ID = "appXooH0bbhwJh3QT";
const TABLE_ID = "tbl3HQU5rwtitOSNr";

// Long enough for a real message, short enough that nobody can post a novel.
const MAX_MESSAGE = 5000;
const MAX_NAME = 200;

export async function POST(req: NextRequest) {
  try {
    const { name, email, message, company } = await req.json();

    // Honeypot: the field is hidden, so only a bot fills it in. Report
    // success rather than an error, which tells a scraper nothing.
    if (typeof company === "string" && company.trim()) {
      return NextResponse.json({ success: true });
    }

    if (typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (typeof email !== "string" || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json(
        { error: "A valid email is required" },
        { status: 400 }
      );
    }
    if (typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const fields = {
      Name: name.trim().slice(0, MAX_NAME),
      Email: email.trim(),
      Message: message.trim().slice(0, MAX_MESSAGE),
    };

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
      console.error("Airtable contact error:", error);
      return NextResponse.json(
        { error: "Failed to send your message" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Contact submit error:", e);
    return NextResponse.json(
      { error: "Failed to send your message" },
      { status: 500 }
    );
  }
}
