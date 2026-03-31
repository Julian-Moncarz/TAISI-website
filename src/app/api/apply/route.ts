import { NextRequest, NextResponse } from "next/server";
import { sendApplicationConfirmation } from "@/lib/email";

const PAT = process.env.AIRTABLE_PAT!;
const BASE_ID = process.env.AIRTABLE_BASE_ID!;
const TABLE_ID = process.env.AIRTABLE_TABLE_ID!;
const RESUME_FIELD_ID = process.env.AIRTABLE_RESUME_FIELD_ID!;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const fields: Record<string, unknown> = {
      "Full Name": formData.get("name"),
      Email: formData.get("email"),
      Major: formData.get("major"),
      Year: formData.get("year"),
      "Why do you want to do this program?": formData.get("why"),
      "May 2026 Availability": formData.get("availabilityMay"),
      "June 2026 Availability": formData.get("availabilityJune"),
      "July 2026 Availability": formData.get("availabilityJuly"),
      "August 2026 Availability": formData.get("availabilityAugust"),
    };

    const projectLink = formData.get("projectLink") as string;
    if (projectLink) {
      fields["Project Link"] = projectLink;
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

    const email = formData.get("email") as string;
    const name = formData.get("name") as string;
    if (email) {
      sendApplicationConfirmation(email, name || "there");
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Submit error:", e);
    return NextResponse.json(
      { error: "Failed to submit application" },
      { status: 500 }
    );
  }
}
