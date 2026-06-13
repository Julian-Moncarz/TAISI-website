import { NextRequest, NextResponse } from "next/server";
import {
  SURVEY,
  buildSubmissionId,
  createAirtableRecord,
  createAirtableRecords,
  fetchConfirmedParticipants,
  toAgreementLabel,
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

    const submissionId = buildSubmissionId(participant.name);
    const submittedAt = new Date().toISOString();

    const f = SURVEY.pulse.fields;
    const fields: Record<string, unknown> = {
      [f.submissionId]: submissionId,
      [f.participant]: [participant.id],
      [f.submittedAt]: submittedAt,
      [f.week]: week,
    };
    const dayNpsLabel = toAgreementLabel(
      typeof body.dayNps === "number" ? body.dayNps : null
    );
    if (dayNpsLabel) fields[f.dayNps] = dayNpsLabel;
    if (body.bestPart) fields[f.bestPart] = String(body.bestPart);
    if (body.whatChange) fields[f.whatChange] = String(body.whatChange);
    if (body.anythingElse) fields[f.anythingElse] = String(body.anythingElse);
    if (body.readings) fields[f.readings] = String(body.readings);
    if (body.taFrequency) fields[f.taFrequency] = String(body.taFrequency);
    if (body.notebookDifficulty)
      fields[f.notebookDifficulty] = String(body.notebookDifficulty);

    await createAirtableRecord(SURVEY.pulse.tableId, fields);

    // Activity ratings: one row per rated activity, grouped by submissionId.
    const ratings =
      body.activityRatings && typeof body.activityRatings === "object"
        ? (body.activityRatings as Record<string, unknown>)
        : {};
    const reasons =
      body.activityReasons && typeof body.activityReasons === "object"
        ? (body.activityReasons as Record<string, unknown>)
        : {};
    const r = SURVEY.pulseRatings.fields;
    const ratingRows = Object.entries(ratings)
      .filter(([, v]) => typeof v === "number")
      .map(([activity, value]) => {
        const row: Record<string, unknown> = {
          [r.submissionId]: submissionId,
          [r.participant]: [participant.id],
          [r.submittedAt]: submittedAt,
          [r.week]: week,
          [r.activity]: activity,
          [r.rating]: value as number,
        };
        // Capture the "why" only for low ratings (2 or 1).
        if ((value as number) <= 2 && reasons[activity])
          row[r.reason] = String(reasons[activity]);
        return row;
      });
    if (ratingRows.length) {
      await createAirtableRecords(SURVEY.pulseRatings.tableId, ratingRows);
    }

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
