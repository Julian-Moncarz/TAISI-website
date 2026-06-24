import { NextRequest, NextResponse } from "next/server";

const PAT = process.env.AIRTABLE_PAT!;
// Summer Intensives base -> "Round 1 Applications" table
const BASE_ID = "appVfG77MoQbG3bgi";
const TABLE_ID = "tblAY3NOSFhZ8EBad";
const RESUME_FIELD_ID = "fldLnuYomZNml9c2S";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const email = formData.get("email");
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const fields: Record<string, unknown> = {
      Name: formData.get("name"),
      Email: email,
      LinkedIn: formData.get("linkedin"),
      "Why this program": formData.get("why"),
      "Weakest claims": formData.get("weakest"),
      "Strongest claims": formData.get("strongest"),
      "Submitted at": new Date().toISOString(),
    };

    const github = formData.get("github") as string;
    if (github && github.trim()) {
      fields["Github"] = github.trim();
    }

    // Step 1: Create the record (without resume)
    const createRes = await fetch(
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

    if (!createRes.ok) {
      const error = await createRes.text();
      console.error("Airtable create error:", error);
      return NextResponse.json(
        { error: "Failed to submit application" },
        { status: 500 }
      );
    }

    const createData = await createRes.json();
    const recordId = createData.records?.[0]?.id;

    // Step 2: Upload resume attachment if provided
    const resume = formData.get("resume") as File | null;
    if (resume && resume.size > 0 && recordId) {
      try {
        const fileBytes = Buffer.from(await resume.arrayBuffer());
        const fileBase64 = fileBytes.toString("base64");

        const uploadRes = await fetch(
          `https://content.airtable.com/v0/${BASE_ID}/${recordId}/${RESUME_FIELD_ID}/uploadAttachment`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${PAT}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contentType: resume.type || "application/octet-stream",
              filename: resume.name || "resume",
              file: fileBase64,
            }),
          }
        );

        if (!uploadRes.ok) {
          const uploadError = await uploadRes.text();
          console.error("Airtable attachment upload error:", uploadError);
          // Record was already created, just log the attachment failure
        }
      } catch (attachErr) {
        console.error("Attachment upload error:", attachErr);
        // Record was already created, continue without resume
      }
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Round 1 application submit error:", e);
    return NextResponse.json(
      { error: "Failed to submit application" },
      { status: 500 }
    );
  }
}
