import { NextRequest, NextResponse } from "next/server";
import {
  APPLICATIONS_TABLE_ID,
  SURVEY,
  SURVEY_BASE_ID,
  airtableHeaders,
  buildSubmissionId,
  createAirtableRecord,
  fetchConfirmedParticipants,
} from "@/lib/survey";

const PAT = process.env.AIRTABLE_PAT!;
const APPLICATIONS_BIO_FIELD_ID = "fld5uy3jZxdFzXCvZ";
const APPLICATIONS_PHOTO_FIELD_ID = "fld0phrVcHcHBz3gf";

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

    const knowledgeAis = numOrNull(form.get("knowledgeAis"));
    if (knowledgeAis !== null) fields[f.knowledgeAis] = knowledgeAis;
    const knowledgeEvals = numOrNull(form.get("knowledgeEvals"));
    if (knowledgeEvals !== null) fields[f.knowledgeEvals] = knowledgeEvals;
    const knowledgeFt = numOrNull(form.get("knowledgeFt"));
    if (knowledgeFt !== null) fields[f.knowledgeFt] = knowledgeFt;
    const knowledgeMech = numOrNull(form.get("knowledgeMech"));
    if (knowledgeMech !== null) fields[f.knowledgeMech] = knowledgeMech;
    const fieldFit = numOrNull(form.get("fieldFit"));
    if (fieldFit !== null) fields[f.fieldFit] = fieldFit;
    const careerClarity = numOrNull(form.get("careerClarity"));
    if (careerClarity !== null) fields[f.careerClarity] = careerClarity;

    const careerBucket = form.get("careerBucket");
    if (careerBucket) fields[f.careerBucket] = String(careerBucket);
    const careerBucketOther = form.get("careerBucketOther");
    if (careerBucketOther) fields[f.careerBucketOther] = String(careerBucketOther);

    await createAirtableRecord(SURVEY.intake.tableId, fields);

    // Write bio + photo back to the participant's Applications record.
    const bio = form.get("bio");
    if (bio && String(bio).trim()) {
      const patchRes = await fetch(
        `https://api.airtable.com/v0/${SURVEY_BASE_ID}/${APPLICATIONS_TABLE_ID}/${participant.id}`,
        {
          method: "PATCH",
          headers: airtableHeaders(),
          body: JSON.stringify({
            fields: { [APPLICATIONS_BIO_FIELD_ID]: String(bio) },
          }),
        }
      );
      if (!patchRes.ok) {
        console.error(
          "Airtable bio update error:",
          patchRes.status,
          await patchRes.text()
        );
      }
    }

    const photo = form.get("photo");
    if (photo && photo instanceof File && photo.size > 0) {
      try {
        const bytes = Buffer.from(await photo.arrayBuffer());
        const uploadRes = await fetch(
          `https://content.airtable.com/v0/${SURVEY_BASE_ID}/${participant.id}/${APPLICATIONS_PHOTO_FIELD_ID}/uploadAttachment`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${PAT}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contentType: photo.type || "application/octet-stream",
              filename: photo.name || "photo",
              file: bytes.toString("base64"),
            }),
          }
        );
        if (!uploadRes.ok) {
          console.error(
            "Airtable photo upload error:",
            uploadRes.status,
            await uploadRes.text()
          );
        }
      } catch (err) {
        console.error("Photo upload error:", err);
      }
    }

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
