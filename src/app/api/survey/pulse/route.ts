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
    const week = String(body.week || "").trim();
    if (!participantId)
      return NextResponse.json({ error: "Missing participant" }, { status: 400 });
    if (!week)
      return NextResponse.json({ error: "Missing week" }, { status: 400 });

    const participants = await fetchConfirmedParticipants();
    const participant = participants.find((p) => p.id === participantId);
    if (!participant) {
      return NextResponse.json(
        { error: "We could not find that participant." },
        { status: 400 }
      );
    }

    const f = SURVEY.pulse.fields;
    const fields: Record<string, unknown> = {
      [f.submissionId]: buildSubmissionId(participant.name),
      [f.participant]: [participant.id],
      [f.submittedAt]: new Date().toISOString(),
      [f.week]: week,
    };
    if (typeof body.dayNps === "number") fields[f.dayNps] = body.dayNps;
    if (body.bestPart) fields[f.bestPart] = String(body.bestPart);
    if (body.whatChange) fields[f.whatChange] = String(body.whatChange);
    if (body.anythingElse) fields[f.anythingElse] = String(body.anythingElse);

    await createAirtableRecord(SURVEY.pulse.tableId, fields);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Pulse survey submission error:", error);
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
