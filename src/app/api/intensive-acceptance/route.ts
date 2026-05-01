import { NextRequest, NextResponse } from "next/server";
import {
  sendIntensiveAcceptanceConfirmation,
  sendIntensiveAcceptanceDecline,
} from "@/lib/email";

const PAT = process.env.AIRTABLE_PAT!;
const BASE_ID = process.env.AIRTABLE_BASE_ID!;
const TABLE_ID = process.env.AIRTABLE_TABLE_ID!;

type AirtableRecord = {
  id: string;
  fields?: Record<string, unknown>;
};

class UserFacingError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
  }
}

const VALID_STATUSES = new Set(["Confirmed", "Declined"]);

const COHORT_DETAILS: Record<string, { name: string; dates: string }> = {
  "June Sat": {
    name: "June Saturday",
    dates: "June 6, 13, 20, and 27, 2026",
  },
  "June Sun": {
    name: "June Sunday",
    dates: "June 7, 14, 21, and 28, 2026",
  },
  "July Sat": {
    name: "July Saturday",
    dates: "July 4, 11, 18, and 25, 2026",
  },
  "July Sun": {
    name: "July Sunday",
    dates: "July 5, 12, 19, and 26, 2026",
  },
  "August Sat": {
    name: "August Saturday",
    dates: "August 1, 8, 15, and 22, 2026",
  },
  "August Sun": {
    name: "August Sunday",
    dates: "August 2, 9, 16, and 23, 2026",
  },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const recordId = stringValue(body.recordId);
    const submittedCohort = stringValue(body.cohort);
    const name = stringValue(body.name);
    const email = stringValue(body.email).toLowerCase();
    const status = stringValue(body.status);
    const notes = stringValue(body.notes);
    const hasValidEmail = Boolean(email && email.includes("@"));

    if (email && !hasValidEmail) {
      return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
    }

    if (!VALID_STATUSES.has(status)) {
      return NextResponse.json({ error: "Please choose whether you commit to attending" }, { status: 400 });
    }

    if (recordId) {
      await updateAcceptance(recordId, status, notes);
      await sendAcceptanceResponseEmailIfNeeded({
        email,
        name,
        status,
        cohort: submittedCohort,
      });

      return NextResponse.json({
        success: true,
        status,
        cohort: submittedCohort,
      });
    }

    if (!hasValidEmail) {
      return NextResponse.json(
        { error: "Please use the personalized confirmation link from your acceptance email." },
        { status: 400 }
      );
    }

    const record = await findRecordByEmail(email);

    if (!record) {
      return NextResponse.json(
        { error: "We could not find your application. Please check your email or reply to us directly." },
        { status: 404 }
      );
    }

    const recordEmail = stringValue(record.fields?.Email).toLowerCase();
    if (recordEmail && recordEmail !== email) {
      return NextResponse.json(
        { error: "The email does not match this application record." },
        { status: 400 }
      );
    }

    const decision = stringValue(record.fields?.Decision);
    const cohort = stringValue(record.fields?.cohort);
    if (decision !== "Intensive" || !cohort) {
      return NextResponse.json(
        { error: "This form is only for accepted summer intensive applicants." },
        { status: 400 }
      );
    }

    await updateAcceptance(record.id, status, notes);
    await sendAcceptanceResponseEmailIfNeeded({
      email,
      name,
      status,
      cohort,
    });

    return NextResponse.json({
      success: true,
      status,
      cohort,
    });
  } catch (error) {
    console.error("Acceptance confirmation error:", error);
    if (error instanceof UserFacingError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { error: "Something went wrong while saving your confirmation. Please reply to your acceptance email and we will confirm manually." },
      { status: 500 }
    );
  }
}

async function sendAcceptanceResponseEmailIfNeeded({
  email,
  name,
  status,
  cohort,
}: {
  email: string;
  name: string;
  status: string;
  cohort: string;
}) {
  if (!email) return;

  if (status === "Declined") {
    await sendIntensiveAcceptanceDecline({
      email,
      name,
    });
    return;
  }

  if (status !== "Confirmed") return;

  const details = COHORT_DETAILS[cohort];
  await sendIntensiveAcceptanceConfirmation({
    email,
    name,
    cohort: details?.name || cohort,
    dates: details?.dates,
  });
}

async function findRecordByEmail(email: string): Promise<AirtableRecord | null> {
  const url = new URL(`https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`);
  url.searchParams.set("pageSize", "100");
  url.searchParams.append("fields[]", "Email");
  url.searchParams.append("fields[]", "Decision");
  url.searchParams.append("fields[]", "cohort");
  url.searchParams.set("filterByFormula", `LOWER({Email}) = '${escapeFormulaString(email)}'`);

  const res = await fetch(url.toString(), {
    headers: airtableHeaders(),
  });

  if (!res.ok) {
    const airtableError = await readAirtableError(res);
    console.error("Airtable acceptance lookup error:", airtableError);
    throw new UserFacingError(
      airtableLookupErrorMessage(res.status, airtableError),
      res.status >= 500 ? 502 : 500
    );
  }

  const data = await res.json();
  return data.records?.[0] || null;
}

async function updateAcceptance(recordId: string, status: string, notes: string) {
  const fields: Record<string, string> = {
    "Acceptance Status": status,
    "Acceptance Confirmed At": new Date().toISOString(),
  };

  if (notes) {
    fields["Acceptance Notes"] = notes;
  }

  const updateRes = await fetch(
    `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`,
    {
      method: "PATCH",
      headers: airtableHeaders(),
      body: JSON.stringify({
        records: [{ id: recordId, fields }],
      }),
    }
  );

  if (!updateRes.ok) {
    const airtableError = await readAirtableError(updateRes);
    console.error("Airtable acceptance update error:", airtableError);
    throw new UserFacingError(
      airtableUpdateErrorMessage(updateRes.status, airtableError),
      airtableUpdateErrorStatus(updateRes.status, airtableError)
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

function escapeFormulaString(value: string) {
  return value.replace(/'/g, "\\'");
}

async function readAirtableError(res: Response) {
  const text = await res.text();
  try {
    return JSON.stringify(JSON.parse(text));
  } catch {
    return text;
  }
}

function airtableLookupErrorMessage(status: number, detail: string) {
  if (status === 401 || status === 403) {
    return "Please use the personalized confirmation link from your acceptance email. This page cannot look up applications by email alone.";
  }

  if (status === 404) {
    return "We could not look up your application because the Airtable table was not found. Please reply to your acceptance email and we will confirm manually.";
  }

  return "We could not look up your application by email. Please use the personalized confirmation link from your acceptance email, or reply to us directly.";
}

function airtableUpdateErrorMessage(status: number, detail: string) {
  if (status === 401 || status === 403) {
    return "We could not save your confirmation because the website's Airtable connection is missing write access. Please reply to your acceptance email and we will confirm manually.";
  }

  if (status === 404) {
    return "We could not save your confirmation because this confirmation link does not match a current application record. Please check that you used the newest link.";
  }

  if (detail.includes("UNKNOWN_FIELD_NAME")) {
    return "We could not save your confirmation because the acceptance fields are missing in Airtable. Please reply to your acceptance email and we will confirm manually.";
  }

  if (detail.includes("INVALID_MULTIPLE_CHOICE_OPTIONS")) {
    return "We could not save your confirmation because Airtable does not recognize that confirmation status. Please refresh the page and try again.";
  }

  if (
    detail.includes("ROW_DOES_NOT_EXIST") ||
    detail.includes("INVALID_RECORDS") ||
    detail.includes("NOT_FOUND") ||
    detail.includes("could not be found")
  ) {
    return "We could not save your confirmation because this confirmation link does not match a current application record. Please check that you used the newest link.";
  }

  return "We could not save your confirmation because Airtable returned an error. Please try again, or reply to your acceptance email and we will confirm manually.";
}

function airtableUpdateErrorStatus(status: number, detail: string) {
  if (
    status === 404 ||
    detail.includes("ROW_DOES_NOT_EXIST") ||
    detail.includes("INVALID_RECORDS") ||
    detail.includes("NOT_FOUND") ||
    detail.includes("could not be found")
  ) {
    return 404;
  }

  return status >= 500 ? 502 : 500;
}
