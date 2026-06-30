import { NextRequest, NextResponse } from "next/server";
import {
  SURVEY,
  buildSubmissionId,
  createAirtableRecord,
  fetchConfirmedParticipants,
  toAgreementLabel,
} from "@/lib/survey";

function numOrNull(v: FormDataEntryValue | null): number | null {
  if (v === null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const participantId = String(form.get("participantId") || "").trim();
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

    const counterfactual = form.get("counterfactual");
    if (counterfactual) fields[f.counterfactual] = String(counterfactual);

    // 5-point agreement scales are stored as label text, not a number.
    const knowledgeAis = toAgreementLabel(numOrNull(form.get("knowledgeAis")));
    if (knowledgeAis) fields[f.knowledgeAis] = knowledgeAis;
    const knowledgeEvals = toAgreementLabel(numOrNull(form.get("knowledgeEvals")));
    if (knowledgeEvals) fields[f.knowledgeEvals] = knowledgeEvals;
    const knowledgeFt = toAgreementLabel(numOrNull(form.get("knowledgeFt")));
    if (knowledgeFt) fields[f.knowledgeFt] = knowledgeFt;
    const knowledgeMech = toAgreementLabel(numOrNull(form.get("knowledgeMech")));
    if (knowledgeMech) fields[f.knowledgeMech] = knowledgeMech;
    const fieldFit = toAgreementLabel(numOrNull(form.get("fieldFit")));
    if (fieldFit) fields[f.fieldFit] = fieldFit;
    const careerClarity = toAgreementLabel(numOrNull(form.get("careerClarity")));
    if (careerClarity) fields[f.careerClarity] = careerClarity;
    const belonging = toAgreementLabel(numOrNull(form.get("belonging")));
    if (belonging) fields[f.belonging] = belonging;
    const selfEfficacy = toAgreementLabel(numOrNull(form.get("selfEfficacy")));
    if (selfEfficacy) fields[f.selfEfficacy] = selfEfficacy;

    const careerBucketRaw = form.get("careerBucket");
    if (careerBucketRaw) {
      try {
        const parsed = JSON.parse(String(careerBucketRaw));
        if (Array.isArray(parsed) && parsed.every((x) => typeof x === "string") && parsed.length > 0) {
          fields[f.careerBucket] = parsed;
        }
      } catch {
        // ignore malformed
      }
    }
    const careerBucketOther = form.get("careerBucketOther");
    if (careerBucketOther) fields[f.careerBucketOther] = String(careerBucketOther);

    const pronouns = form.get("pronouns");
    if (pronouns && String(pronouns).trim()) fields[f.pronouns] = String(pronouns).trim();
    const dietaryRestrictions = form.get("dietaryRestrictions");
    if (dietaryRestrictions && String(dietaryRestrictions).trim())
      fields[f.dietaryRestrictions] = String(dietaryRestrictions).trim();

    const photoConsent = form.get("photoConsent");
    fields[f.photoConsent] = String(photoConsent) === "true";

    const shirtSize = form.get("shirtSize");
    if (shirtSize && String(shirtSize).trim())
      fields[f.shirtSize] = String(shirtSize).trim();

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
