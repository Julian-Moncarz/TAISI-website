import { NextRequest, NextResponse } from "next/server";
import {
  SURVEY,
  buildSubmissionId,
  createAirtableRecord,
  fetchConfirmedParticipants,
  toAgreementLabel,
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

    const str = (v: unknown) => (typeof v === "string" && v.trim() ? v : undefined);
    const arr = (v: unknown) =>
      Array.isArray(v) && v.every((x) => typeof x === "string") ? (v as string[]) : undefined;
    // 5-point agreement scales are stored as label text, not a number.
    const agree = (v: unknown) =>
      toAgreementLabel(typeof v === "number" ? v : null) ?? undefined;

    const set = (key: string, v: unknown) => {
      if (v !== undefined) fields[key] = v;
    };

    set(f.knowledgeAis, agree(body.knowledgeAis));
    set(f.knowledgeEvals, agree(body.knowledgeEvals));
    set(f.knowledgeFt, agree(body.knowledgeFt));
    set(f.knowledgeMech, agree(body.knowledgeMech));
    set(f.fieldFit, agree(body.fieldFit));
    set(f.careerClarity, agree(body.careerClarity));
    set(f.belonging, agree(body.belonging));
    set(f.selfEfficacy, agree(body.selfEfficacy));
    set(f.canNameOrgs, str(body.canNameOrgs));
    set(f.orgsList, str(body.orgsList));
    set(f.barriers, arr(body.barriers));
    set(f.barriersOther, str(body.barriersOther));
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
    set(f.programNps, agree(body.programNps));
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
