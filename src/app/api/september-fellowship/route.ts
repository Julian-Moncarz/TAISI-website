import { NextRequest, NextResponse } from "next/server";
import { sendSeptemberFellowshipConfirmation } from "@/lib/email";

const PAT = process.env.AIRTABLE_PAT!;
const BASE_ID = process.env.AIRTABLE_BASE_ID!;
const TABLE_ID = process.env.AIRTABLE_TABLE_ID!;

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
    const name = stringValue(body.name);
    const email = stringValue(body.email).toLowerCase();
    const wantsSpot = Boolean(body.wantsSpot);
    const hasValidEmail = Boolean(email && email.includes("@"));

    if (email && !hasValidEmail) {
      return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
    }

    if (!recordId) {
      return NextResponse.json(
        { error: "Please use the personalized link from your email." },
        { status: 400 }
      );
    }

    if (!wantsSpot) {
      return NextResponse.json(
        { error: "Please confirm that you would like the September fellowship spot." },
        { status: 400 }
      );
    }

    await updateSeptemberFellowship(recordId);
    if (hasValidEmail) {
      await sendSeptemberFellowshipConfirmation({ email, name });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("September fellowship response error:", error);
    if (error instanceof UserFacingError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { error: "Something went wrong while saving your response. Please reply to your email and we will record it manually." },
      { status: 500 }
    );
  }
}

async function updateSeptemberFellowship(recordId: string) {
  const fields = {
    "September Fellowship Status": "Requested",
    "September Fellowship Submitted At": new Date().toISOString(),
  };

  const updateRes = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`, {
    method: "PATCH",
    headers: airtableHeaders(),
    body: JSON.stringify({
      records: [{ id: recordId, fields }],
    }),
  });

  if (!updateRes.ok) {
    const airtableError = await readAirtableError(updateRes);
    console.error("Airtable September fellowship update error:", airtableError);
    throw new UserFacingError(
      airtableUpdateErrorMessage(updateRes.status, airtableError),
      updateRes.status >= 500 ? 502 : 500
    );
  }
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
    return "We could not save your response because the website's Airtable connection is missing write access. Please reply to your email and we will record it manually.";
  }

  if (
    status === 404 ||
    detail.includes("ROW_DOES_NOT_EXIST") ||
    detail.includes("INVALID_RECORDS") ||
    detail.includes("NOT_FOUND") ||
    detail.includes("could not be found")
  ) {
    return "We could not save your response because this link does not match a current application record. Please check that you used the newest link.";
  }

  if (detail.includes("UNKNOWN_FIELD_NAME")) {
    return "We could not save your response because the follow-up fields are missing in Airtable. Please reply to your email and we will record it manually.";
  }

  return "We could not save your response because Airtable returned an error. Please try again, or reply to your email and we will record it manually.";
}
