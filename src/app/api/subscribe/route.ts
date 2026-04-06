import { NextRequest, NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/lib/email";

const PAT = process.env.AIRTABLE_PAT!;
const BASE_ID = "appLQunyWZ3t3kx5o";
const TABLE_ID = "tblH7kI5rrYwne7a9";

export async function POST(req: NextRequest) {
  try {
    const { email, source } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const fields: Record<string, string> = {
      email: email,
      "Submission time": new Date().toISOString(),
    };

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
    console.error("Subscribe error:", e);
    return NextResponse.json(
      { error: "Failed to save email" },
      { status: 500 }
    );
  }
}
