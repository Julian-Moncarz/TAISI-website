import { NextRequest, NextResponse } from "next/server";
import { SURVEY, fetchLatestSurveyRecord } from "@/lib/survey";

export const dynamic = "force-dynamic";

// Returns prefill data for a follow-on survey based on the participant's latest
// prior submission. ?participantId=...&form=intake|exit
//
//  form=intake -> returns last intake's knowledge scores + field-fit + career clarity
//  form=exit   -> returns last exit's 30-day commitment + stay-in-touch names
export async function GET(req: NextRequest) {
  const participantId = req.nextUrl.searchParams.get("participantId") || "";
  const form = req.nextUrl.searchParams.get("form") || "";
  if (!participantId) {
    return NextResponse.json({ error: "Missing participantId" }, { status: 400 });
  }

  try {
    if (form === "intake") {
      const f = SURVEY.intake.fields;
      const r = await fetchLatestSurveyRecord(
        SURVEY.intake.tableId,
        f.participant,
        participantId
      );
      if (!r) return NextResponse.json({ found: false });
      return NextResponse.json({
        found: true,
        knowledgeAis: r[f.knowledgeAis] ?? null,
        knowledgeEvals: r[f.knowledgeEvals] ?? null,
        knowledgeFt: r[f.knowledgeFt] ?? null,
        knowledgeMech: r[f.knowledgeMech] ?? null,
        fieldFit: r[f.fieldFit] ?? null,
        careerClarity: r[f.careerClarity] ?? null,
      });
    }

    if (form === "exit") {
      const f = SURVEY.exit.fields;
      const r = await fetchLatestSurveyRecord(
        SURVEY.exit.tableId,
        f.participant,
        participantId
      );
      if (!r) return NextResponse.json({ found: false });
      return NextResponse.json({
        found: true,
        commitment: r[f.commitment] ?? "",
        stayInTouch: r[f.stayInTouch] ?? "",
      });
    }

    return NextResponse.json({ error: "Unknown form" }, { status: 400 });
  } catch (error) {
    console.error("Prefill error:", error);
    return NextResponse.json(
      { error: "Could not load prefill" },
      { status: 500 }
    );
  }
}
