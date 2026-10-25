"use client";

import { useEffect, useState } from "react";
import { Challenge } from "@/types";

export default function SavedChallenges({ refreshTrigger }: { refreshTrigger: string }) {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch the list every time the parent tells us something was saved
  useEffect(() => {
    setLoading(true);
    fetch("/api/challenges")
      .then((r) => r.json())
      .then((d) => setChallenges(d.challenges ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [refreshTrigger]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400 text-sm gap-2">
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        Loading…
      </div>
    );
  }

  if (challenges.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
        <img src="/tou-full-logo.svg" alt="" aria-hidden style={{ height: 20, opacity: 0.2 }} />
        <p className="text-sm font-semibold text-gray-600">No saved challenges yet</p>
        <p className="text-xs text-gray-400 max-w-xs">
          Go to <span className="font-semibold text-[#3B28CC]">Create Milestones</span>, accept
          some milestones, then hit Save.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
        {challenges.length} saved
      </p>

      {challenges.map((c) => (
        <div key={c.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">

          <div className="flex items-start justify-between gap-2 mb-3">
            <p className="text-sm font-bold text-gray-800">{c.title}</p>
            <span className="text-[10px] text-gray-400 bg-gray-100 rounded-full px-2 py-0.5 shrink-0">
              {new Date(c.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
            </span>
          </div>

          <div className="space-y-2">
            {c.milestones.map((m, i) => (
              <div key={m.id} className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-[#3B28CC]/10 text-[#3B28CC] text-[10px] font-bold
                                 flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <div>
                  <p className="text-xs font-semibold text-gray-700">{m.title}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">{m.description}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      ))}
    </div>
  );
}
