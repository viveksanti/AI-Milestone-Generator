import { Challenge } from "@/types";

// In-memory store — resets on server restart.
// To persist across restarts, swap this for a JSON file or MongoDB.
const store: Map<string, Challenge> = new Map();

export function saveChallenge(challenge: Challenge): void {
  store.set(challenge.id, challenge);
}

export function getChallenge(id: string): Challenge | undefined {
  return store.get(id);
}

export function getAllChallenges(): Challenge[] {
  return Array.from(store.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
