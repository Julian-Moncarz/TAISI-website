import { NextRequest, NextResponse } from "next/server";
import {
  SURVEY,
  buildSubmissionId,
  createAirtableRecord,
  fetchConfirmedParticipants,
} from "@/lib/survey";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const participantId = String(body.participantId || "").trim();
    if (!participantId)
      return NextResponse.json({ error: "Missing participant" }, { status: 400 });

    const participants = await fetchConfirmedParticipants();
    const participant = participants.find((p) => p.id === participantId);
    if (!participant) {
      return NextResponse.json(
        { error: "We could not find that participant." },
        { status: 400 }
      );
    }

    const f = SURVEY.followup.fields;
    const fields: Record<string, unknown> = {
      [f.submissionId]: buildSubmissionId(participant.name),
      [f.participant]: [participant.id],
      [f.submittedAt]: new Date().toISOString(),
    };

    const num = (v: unknown) => (typeof v === "number" ? v : undefined);
    const str = (v: unknown) => (typeof v === "string" && v.trim() ? v : undefined);
    const arr = (v: unknown) =>
      Array.isArray(v) && v.every((x) => typeof x === "string") ? (v as string[]) : undefined;
    const set = (key: string, v: unknown) => {
      if (v !== undefined) fields[key] = v;
    };

    set(f.hoursPerWeek, str(body.hoursPerWeek));
    set(f.involvement, arr(body.involvement));
    set(f.fellowshipOrJob, str(body.fellowshipOrJob));
    set(f.fieldFit, num(body.fieldFit));
    set(f.careerClarity, num(body.careerClarity));
    set(f.stillInTouch, str(body.stillInTouch));

    await createAirtableRecord(SURVEY.followup.tableId, fields);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Follow-up survey submission error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
      },
      { status: 500 }
    );
  }
}
