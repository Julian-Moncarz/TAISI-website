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

    const f = SURVEY.exit.fields;
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

    set(f.knowledgeAis, num(body.knowledgeAis));
    set(f.knowledgeEvals, num(body.knowledgeEvals));
    set(f.knowledgeFt, num(body.knowledgeFt));
    set(f.knowledgeMech, num(body.knowledgeMech));
    set(f.fieldFit, num(body.fieldFit));
    set(f.careerClarity, num(body.careerClarity));
    set(f.careerBucket, arr(body.careerBucket));
    set(f.careerBucketOther, str(body.careerBucketOther));
    set(f.commitment, str(body.commitment));
    set(f.stayInTouch, str(body.stayInTouch));
    set(f.favouriteParts, arr(body.favouriteParts));
    set(f.favouritePartsOther, str(body.favouritePartsOther));
    set(f.mostValuableWeek, str(body.mostValuableWeek));
    set(f.doubleDownOn, str(body.doubleDownOn));
    set(f.cutOrChange, str(body.cutOrChange));
    set(f.peopleToCallOut, str(body.peopleToCallOut));
    set(f.programNps, num(body.programNps));
    set(f.referrals, str(body.referrals));
    set(f.testimonial, str(body.testimonial));
    set(f.futureHelp, arr(body.futureHelp));

    await createAirtableRecord(SURVEY.exit.tableId, fields);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Exit survey submission error:", error);
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
