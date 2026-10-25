import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";

function getClient() {
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");
}

// Models tried in order — verified live against the API's ListModels endpoint.
// Falls through on 503 (overloaded) or 404 (retired), stops on auth/quota errors.
const MODEL_FALLBACKS = [
  "gemini-3.8-flash",      // latest stable flash
  "gemini-3.7-flash",      // one step back
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-2.5-flash",      // widely available stable
  "gemini-2.5-flash-lite", // lightest available
];

const MilestonesOutputSchema = z.object({
  milestones: z
    .array(z.object({ title: z.string(), description: z.string() }))
    .min(3)
    .max(5),
});

const SYSTEM_PROMPT = `You are an expert instructional designer for Tomorrow University — a next-generation, impact-focused university.

Your job is to break down a learning challenge into 3–5 concrete, actionable milestones that guide a learner from start to completion.

Rules:
- Each milestone must have a short, verb-led title (e.g. "Define the problem space") and a 1–2 sentence description explaining what the learner does and why it matters.
- Milestones must be sequential and logically build on each other.
- Keep language clear, motivating, and practical — avoid academic jargon.
- Focus on real-world application and measurable outcomes.
- Output ONLY valid JSON with no markdown fences, matching this exact shape: { "milestones": [ { "title": "...", "description": "..." } ] }`;

async function tryGenerate(userMessage: string): Promise<string> {
  let lastError: Error = new Error("No models available");

  for (const modelName of MODEL_FALLBACKS) {
    try {
      const model = getClient().getGenerativeModel({
        model: modelName,
        generationConfig: { responseMimeType: "application/json", temperature: 0.7 },
        systemInstruction: SYSTEM_PROMPT,
      });
      const result = await model.generateContent(userMessage);
      console.log(`[generate] used model: ${modelName}`);
      return result.response.text();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[generate] ${modelName} failed: ${msg}`);
      // Only fall through to next model on availability errors (503 / 404)
      if (msg.includes("503") || msg.includes("503 Service") || msg.includes("404") || msg.includes("no longer available")) {
        lastError = err instanceof Error ? err : new Error(msg);
        continue;
      }
      // Any other error (auth, quota exhausted, bad request) — throw immediately
      throw err;
    }
  }

  throw lastError;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, brief } = body as { title: string; brief: string };

    if (!title?.trim() || !brief?.trim()) {
      return NextResponse.json(
        { error: "title and brief are required" },
        { status: 400 }
      );
    }

    const userMessage = `Challenge title: ${title}\n\nChallenge brief: ${brief}`;
    const raw = await tryGenerate(userMessage);

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: "AI returned invalid JSON" }, { status: 502 });
    }

    const validated = MilestonesOutputSchema.safeParse(parsed);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid AI response structure", details: validated.error.flatten() },
        { status: 502 }
      );
    }

    return NextResponse.json({ milestones: validated.data.milestones });
  } catch (err: unknown) {
    console.error("[generate] error:", err);
    const message = err instanceof Error ? err.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
