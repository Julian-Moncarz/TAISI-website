import { NextRequest, NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/lib/email";

const PAT = process.env.AIRTABLE_PAT!;
const BASE_ID = process.env.AIRTABLE_BASE_ID!;
const TABLE_ID = "tblVh25vVyhH3aHOe"; // Email List table

export async function POST(req: NextRequest) {
  try {
    const { email, source } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const fields: Record<string, string> = {
      Email: email,
      "Submission time": new Date().toISOString(),
    };
    if (source && typeof source === "string") {
      fields["Source"] = source;
    }

    const res = await fetch(
      `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PAT}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          records: [{ fields }],
        }),
      }
    );

    if (!res.ok) {
      const error = await res.text();
      console.error("Airtable error:", error);
      return NextResponse.json(
        { error: "Failed to save email" },
        { status: 500 }
      );
    }

    await sendWelcomeEmail(email);

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("QR signup error:", e);
    return NextResponse.json(
      { error: "Failed to save email" },
      { status: 500 }
    );
  }
}
