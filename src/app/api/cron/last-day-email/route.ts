import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const PAT = process.env.AIRTABLE_PAT!;
const BASE_ID = process.env.AIRTABLE_BASE_ID!;
const EMAIL_TABLE_ID = "tblVh25vVyhH3aHOe";
const APPLY_URL = "https://taisi.ca/summer-intensive";

export async function GET(req: NextRequest) {
  // Verify this is called by Vercel Cron
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  // Fetch all emails from Airtable (paginated)
  const emails: string[] = [];
  let offset: string | undefined;

  do {
    const url = new URL(
      `https://api.airtable.com/v0/${BASE_ID}/${EMAIL_TABLE_ID}`
    );
    url.searchParams.set("fields[]", "Email");
    if (offset) url.searchParams.set("offset", offset);

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${PAT}` },
    });

    if (!res.ok) {
      console.error("Airtable fetch error:", await res.text());
      return NextResponse.json(
        { error: "Failed to fetch emails" },
        { status: 500 }
      );
    }

    const data = await res.json();
    for (const record of data.records) {
      const email = record.fields?.Email;
      if (email && typeof email === "string") {
        emails.push(email);
      }
    }
    offset = data.offset;
  } while (offset);

  // Deduplicate
  const unique = [...new Set(emails)];

  // Send in batches of 50 (Resend batch limit is 100)
  const BATCH_SIZE = 50;
  let sent = 0;
  let failed = 0;

  for (let i = 0; i < unique.length; i += BATCH_SIZE) {
    const batch = unique.slice(i, i + BATCH_SIZE);

    try {
      await resend.batch.send(
        batch.map((email) => ({
          from: "Julian from TAISI <julian@taisi.ca>",
          to: email,
          subject: "Last day to apply: closes tonight at midnight",
          html: `
<div style="font-family: system-ui, -apple-system, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
  <p style="margin: 0 0 16px;">Applications for TAISI's summer intensive close tonight at midnight.</p>
  <p style="margin: 0 0 24px;">If you signed up but haven't applied yet, we think you have a good shot of getting in. Takes 4 minutes. Just send it in.</p>
  <a href="${APPLY_URL}" style="display: inline-block; background: #D94F30; color: #fff; padding: 14px 28px; text-decoration: none; font-weight: 600; font-size: 16px;">Apply now</a>
  <p style="margin: 24px 0 0; color: #666; font-size: 14px;">Julian Moncarz<br/>TAISI</p>
</div>`,
        }))
      );
      sent += batch.length;
    } catch (err) {
      console.error(`Batch send error (batch starting at ${i}):`, err);
      failed += batch.length;
    }
  }

  console.log(`Last day email: sent=${sent}, failed=${failed}, total=${unique.length}`);
  return NextResponse.json({ sent, failed, total: unique.length });
}
