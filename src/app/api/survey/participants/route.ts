import { NextResponse } from "next/server";
import { fetchConfirmedParticipants } from "@/lib/survey";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const participants = await fetchConfirmedParticipants();
    return NextResponse.json({ participants });
  } catch (error) {
    console.error("Participant lookup failed:", error);
    return NextResponse.json(
      { error: "Could not load participants" },
      { status: 500 }
    );
  }
}
