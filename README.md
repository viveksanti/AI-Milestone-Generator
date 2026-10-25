# AI Milestone Generator

A small internal tool for Tomorrow University staff. You describe a learning challenge, Gemini drafts the milestones, you pick the ones worth keeping, and they get saved.

---

## Getting started

```bash
npm install
cp .env.example .env.local   # then add your Gemini API key
npm run dev
```

Get a free Gemini key at [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey).

---

## How it works

1. Fill in a challenge title and brief
2. Click **Generate Milestones** — Gemini returns 3–5 drafts
3. Accept, reject, or edit each one
4. Hit Save — only the accepted ones are stored

---

## Stack

- **Next.js 15** — one repo for frontend and API routes
- **Gemini** (`@google/generative-ai`) — free tier, good JSON support
- **Zod** — validates the AI response before it touches the UI
- **Tailwind CSS** — styling
- **In-memory store** — a simple Map in `lib/store.ts`; resets on restart. To use MongoDB, just swap the two functions in that file (`saveChallenge` and `getAllChallenges`).

---

## Prompt and schema

The system prompt lives in `src/app/api/generate/route.ts`. It asks Gemini to act as an instructional designer and return milestones as plain JSON — verb-led titles, one or two sentences each, in a logical sequence.

Gemini is called with `responseMimeType: "application/json"` so it can only return JSON. That gets validated with Zod before anything reaches the client.

---

## Error handling

- Empty form fields → button stays disabled
- Gemini overloaded or model retired → retries through a list of 6 fallback models automatically
- Bad JSON from AI → caught, returns a clear error to the UI
- Nothing accepted before saving → Save button stays disabled

---

## Project layout

```
src/
├── app/
│   ├── api/generate/route.ts       calls Gemini, validates response
│   ├── api/challenges/route.ts     saves and lists challenges
│   └── page.tsx                    all the UI
├── components/
│   ├── MilestoneCard.tsx           single milestone — accept/reject/edit
│   └── SavedChallenges.tsx         the saved challenges tab
└── lib/
    └── store.ts                    in-memory persistence
```
