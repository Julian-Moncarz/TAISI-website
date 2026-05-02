import { NextRequest, NextResponse } from "next/server";

const PAT = process.env.AIRTABLE_PAT!;
const BASE_ID = process.env.AIRTABLE_BASE_ID!;
const TABLE_ID = process.env.AIRTABLE_TABLE_ID!;

const VALID_EVENINGS = new Set(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]);

class UserFacingError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const recordId = stringValue(body.recordId);
    const session1Evenings = eveningArray(body.session1Evenings);
    const session2Evenings = eveningArray(body.session2Evenings);
    const notes = stringValue(body.notes);

    if (!recordId) {
      return NextResponse.json(
        { error: "Please use the personalized link from your email." },
        { status: 400 }
      );
    }

    if (session1Evenings.length === 0 && session2Evenings.length === 0) {
      return NextResponse.json(
        { error: "Please select at least one weekday evening that could work." },
        { status: 400 }
      );
    }

    await updateSummerFellowshipAvailability({
      recordId,
      session1Evenings,
      session2Evenings,
      notes,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Summer fellowship availability error:", error);
    if (error instanceof UserFacingError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { error: "Something went wrong while saving your availability. Please reply to your email and we will record it manually." },
      { status: 500 }
    );
  }
}

async function updateSummerFellowshipAvailability({
  recordId,
  session1Evenings,
  session2Evenings,
  notes,
}: {
  recordId: string;
  session1Evenings: string[];
  session2Evenings: string[];
  notes: string;
}) {
  const fields: Record<string, unknown> = {
    "Summer Fellowship Status": "Interested",
    "Summer Fellowship Session 1 Evenings": session1Evenings,
    "Summer Fellowship Session 2 Evenings": session2Evenings,
    "Summer Fellowship Submitted At": new Date().toISOString(),
  };

  if (notes) {
    fields["Summer Fellowship Notes"] = notes;
  }

  const updateRes = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`, {
    method: "PATCH",
    headers: airtableHeaders(),
    body: JSON.stringify({
      records: [{ id: recordId, fields }],
    }),
  });

  if (!updateRes.ok) {
    const airtableError = await readAirtableError(updateRes);
    console.error("Airtable summer fellowship update error:", airtableError);
    throw new UserFacingError(
      airtableUpdateErrorMessage(updateRes.status, airtableError),
      updateRes.status >= 500 ? 502 : 500
    );
  }
}

function eveningArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .map(stringValue)
    .filter((item): item is string => Boolean(item && VALID_EVENINGS.has(item)));
}

function airtableHeaders() {
  return {
    Authorization: `Bearer ${PAT}`,
    "Content-Type": "application/json",
  };
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

async function readAirtableError(res: Response) {
  const text = await res.text();
  try {
    return JSON.stringify(JSON.parse(text));
  } catch {
    return text;
  }
}

function airtableUpdateErrorMessage(status: number, detail: string) {
  if (status === 401 || status === 403) {
    return "We could not save your availability because the website's Airtable connection is missing write access. Please reply to your email and we will record it manually.";
  }

  if (
    status === 404 ||
    detail.includes("ROW_DOES_NOT_EXIST") ||
    detail.includes("INVALID_RECORDS") ||
    detail.includes("NOT_FOUND") ||
    detail.includes("could not be found")
  ) {
    return "We could not save your availability because this link does not match a current application record. Please check that you used the newest link.";
  }

  if (detail.includes("UNKNOWN_FIELD_NAME")) {
    return "We could not save your availability because the follow-up fields are missing in Airtable. Please reply to your email and we will record it manually.";
  }

  return "We could not save your availability because Airtable returned an error. Please try again, or reply to your email and we will record it manually.";
}
