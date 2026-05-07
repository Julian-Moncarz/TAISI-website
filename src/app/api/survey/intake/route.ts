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
    if (!participantId) {
      return NextResponse.json({ error: "Missing participant" }, { status: 400 });
    }

    const participants = await fetchConfirmedParticipants();
    const participant = participants.find((p) => p.id === participantId);
    if (!participant) {
      return NextResponse.json(
        { error: "We could not find that participant." },
        { status: 400 }
      );
    }

    const f = SURVEY.intake.fields;
    const fields: Record<string, unknown> = {
      [f.submissionId]: buildSubmissionId(participant.name),
      [f.participant]: [participant.id],
      [f.submittedAt]: new Date().toISOString(),
    };

    if (body.counterfactual) fields[f.counterfactual] = String(body.counterfactual);
    if (typeof body.knowledgeAis === "number")
      fields[f.knowledgeAis] = body.knowledgeAis;
    if (typeof body.knowledgeEvals === "number")
      fields[f.knowledgeEvals] = body.knowledgeEvals;
    if (typeof body.knowledgeFt === "number")
      fields[f.knowledgeFt] = body.knowledgeFt;
    if (typeof body.knowledgeMech === "number")
      fields[f.knowledgeMech] = body.knowledgeMech;
    if (typeof body.fieldFit === "number") fields[f.fieldFit] = body.fieldFit;
    if (typeof body.careerClarity === "number")
      fields[f.careerClarity] = body.careerClarity;
    if (body.careerBucket) fields[f.careerBucket] = String(body.careerBucket);
    if (body.careerBucketOther)
      fields[f.careerBucketOther] = String(body.careerBucketOther);

    await createAirtableRecord(SURVEY.intake.tableId, fields);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Intake survey submission error:", error);
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
