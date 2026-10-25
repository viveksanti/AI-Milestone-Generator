import { NextRequest, NextResponse } from "next/server";
import { Challenge, Milestone, SaveRequest } from "@/types";
import { saveChallenge, getAllChallenges } from "@/lib/store";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body: SaveRequest = await req.json();
    const { challengeTitle, challengeBrief, milestones } = body;

    if (!challengeTitle?.trim() || !challengeBrief?.trim()) {
      return NextResponse.json(
        { error: "challengeTitle and challengeBrief are required" },
        { status: 400 }
      );
    }

    const accepted: Milestone[] = milestones.filter(
      (m) => m.status === "accepted"
    );

    if (accepted.length === 0) {
      return NextResponse.json(
        { error: "At least one milestone must be accepted before saving" },
        { status: 400 }
      );
    }

    const challenge: Challenge = {
      id: randomUUID(),
      title: challengeTitle,
      brief: challengeBrief,
      milestones: accepted,
      createdAt: new Date().toISOString(),
    };

    saveChallenge(challenge);

    return NextResponse.json({ success: true, challenge });
  } catch (err: unknown) {
    console.error("[save] error:", err);
    const message = err instanceof Error ? err.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  const challenges = getAllChallenges();
  return NextResponse.json({ challenges });
}
