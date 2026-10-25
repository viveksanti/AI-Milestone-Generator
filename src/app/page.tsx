"use client";

import { useState, useRef } from "react";
import { Milestone, MilestoneStatus } from "@/types";
import { nanoid } from "@/lib/nanoid";
import MilestoneCard from "@/components/MilestoneCard";
import SavedChallenges from "@/components/SavedChallenges";

type Step = "input" | "review" | "saved";
type Tab = "create" | "challenges";

export default function Home() {
  const [tab, setTab] = useState<Tab>("create");
  const [step, setStep] = useState<Step>("input");

  // Form fields
  const [title, setTitle] = useState("");
  const [brief, setBrief] = useState("");

  // The AI-generated milestones. Each one starts as "pending" until staff acts on it.
  const [milestones, setMilestones] = useState<Milestone[]>([]);

  // Loading states for the two async actions
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  // Tracks the count of saved challenges so the tab badge stays up to date
  const [savedCount, setSavedCount] = useState(0);

  // We remember what title+brief was last sent to the AI.
  // The generate button stays locked until the user changes something.
  const [lastGenerated, setLastGenerated] = useState({ title: "", brief: "" });

  const reviewRef = useRef<HTMLDivElement>(null);

  const acceptedCount = milestones.filter((m) => m.status === "accepted").length;

  // Button is active only when there's content AND something has changed since last generate
  const inputChanged = title !== lastGenerated.title || brief !== lastGenerated.brief;
  const canGenerate = !loading && title.trim() !== "" && brief.trim() !== "" && inputChanged;

  // Step 1: send title + brief to the API, get back milestones
  async function generate() {
    if (!canGenerate) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, brief }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");

      // Tag each milestone with a local ID and set status to pending
      const items: Milestone[] = data.milestones.map(
        (m: { title: string; description: string }) => ({
          id: nanoid(),
          title: m.title,
          description: m.description,
          status: "pending" as MilestoneStatus,
        })
      );

      setMilestones(items);
      setLastGenerated({ title, brief });
      setStep("review");
      setTimeout(() => reviewRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  // Called by MilestoneCard whenever a card is accepted, rejected, or edited
  function updateMilestone(id: string, changes: Partial<Milestone>) {
    setMilestones((prev) => prev.map((m) => (m.id === id ? { ...m, ...changes } : m)));
  }

  // Step 2: save only the accepted milestones
  async function save() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeTitle: title, challengeBrief: brief, milestones }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setSavedCount((n) => n + 1);
      setStep("saved");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  // Reset everything back to the empty form
  function reset() {
    setTitle("");
    setBrief("");
    setMilestones([]);
    setError("");
    setLastGenerated({ title: "", brief: "" });
    setStep("input");
  }

  return (
    <main className="min-h-screen bg-[#f5f5f8]">

      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-3 flex items-center justify-between">
          <img src="/tou-full-logo.svg" alt="Tomorrow University" style={{ height: 28, width: "auto" }} />
          {tab === "create" && <StepIndicator step={step} />}
        </div>
      </header>

      {/* Purple banner */}
      <div className="bg-[#3B28CC] text-white">
        <div className="max-w-3xl mx-auto px-6 py-6">
          <h1 className="text-xl font-bold">Milestone Generator</h1>
          <p className="text-white/60 text-sm mt-1">Draft learning milestones with AI, then review before saving.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-6 flex">
          <Tab label="Create Milestones" active={tab === "create"} onClick={() => setTab("create")} />
          <Tab
            label="Saved Challenges"
            active={tab === "challenges"}
            onClick={() => setTab("challenges")}
            badge={savedCount || undefined}
          />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">

        {/* Create tab */}
        {tab === "create" && (
          <div className="space-y-6">

            {/* Input card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
              <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <Badge n="1" active={step === "input"} /> Define the Challenge
              </h2>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={loading}
                  placeholder="e.g. Build a carbon footprint tracker"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                             focus:outline-none focus:ring-2 focus:ring-[#3B28CC]/20 focus:border-[#3B28CC] transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Brief
                </label>
                <textarea
                  value={brief}
                  onChange={(e) => setBrief(e.target.value)}
                  disabled={loading}
                  rows={4}
                  placeholder="What will learners achieve? What's the context and why does it matter?"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                             focus:outline-none focus:ring-2 focus:ring-[#3B28CC]/20 focus:border-[#3B28CC] transition resize-none"
                />
              </div>

              {error && step === "input" && <ErrorBox message={error} onClose={() => setError("")} />}

              <div className="flex items-center gap-3">
                <PurpleButton onClick={generate} disabled={!canGenerate}>
                  {loading ? <><Spinner /> Generating…</> : "✨ Generate Milestones"}
                </PurpleButton>
                {step === "review" && !inputChanged && (
                  <p className="text-xs text-gray-400">Edit title or brief to regenerate.</p>
                )}
              </div>
            </div>

            {/* Milestone review — appears after generation */}
            {step !== "input" && (
              <div ref={reviewRef} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    <Badge n="2" active={step === "review"} /> Review Milestones
                  </h2>
                  <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-3 py-0.5">
                    {acceptedCount} accepted
                  </span>
                </div>

                {error && step === "review" && <ErrorBox message={error} onClose={() => setError("")} />}

                <div className="space-y-2.5">
                  {milestones.map((m, i) => (
                    <MilestoneCard key={m.id} milestone={m} index={i} onUpdate={updateMilestone} />
                  ))}
                </div>

                {step === "review" && (
                  <div className="flex gap-3">
                    <PurpleButton onClick={save} disabled={saving || acceptedCount === 0}>
                      {saving ? <><Spinner /> Saving…</> : `Save ${acceptedCount} milestone${acceptedCount !== 1 ? "s" : ""}`}
                    </PurpleButton>
                    <GhostButton onClick={reset}>Start over</GhostButton>
                  </div>
                )}
              </div>
            )}

            {/* Success state */}
            {step === "saved" && (
              <div className="space-y-4">
                <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  <Badge n="3" active /> Done
                </h2>
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex gap-3">
                  <span className="text-emerald-500 font-bold text-base">✓</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">"{title}" saved</p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {acceptedCount} milestone{acceptedCount !== 1 ? "s" : ""} added.
                    </p>
                    <button
                      onClick={() => setTab("challenges")}
                      className="text-xs text-[#3B28CC] font-semibold mt-2 hover:underline"
                    >
                      View in Saved Challenges →
                    </button>
                  </div>
                </div>
                <PurpleButton onClick={reset}>+ New Challenge</PurpleButton>
              </div>
            )}

          </div>
        )}

        {/* Saved challenges tab */}
        {tab === "challenges" && (
          <SavedChallenges refreshTrigger={String(savedCount)} />
        )}

      </div>
    </main>
  );
}

// Small reusable bits

function Tab({ label, active, onClick, badge }: {
  label: string;
  active: boolean;
  onClick: () => void;
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-5 py-3 text-sm font-semibold border-b-2 transition-colors
        ${active ? "border-[#3B28CC] text-[#3B28CC]" : "border-transparent text-gray-500 hover:text-gray-700"}`}
    >
      {label}
      {badge && (
        <span className="w-4 h-4 rounded-full bg-[#3B28CC] text-white text-[10px] font-bold flex items-center justify-center">
          {badge}
        </span>
      )}
    </button>
  );
}

// Numbered circle — purple when it's the current step, gray otherwise
function Badge({ n, active }: { n: string; active?: boolean }) {
  return (
    <span className={`w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center shrink-0
      ${active ? "bg-[#3B28CC] text-white" : "bg-gray-100 text-gray-400"}`}>
      {n}
    </span>
  );
}

// Shows Define → Review → Done in the header
function StepIndicator({ step }: { step: Step }) {
  const steps = [
    { key: "input", label: "Define" },
    { key: "review", label: "Review" },
    { key: "saved", label: "Done" },
  ] as const;
  const current = steps.findIndex((s) => s.key === step);
  return (
    <div className="flex items-center gap-1 text-xs font-semibold">
      {steps.map((s, i) => (
        <div key={s.key} className="flex items-center gap-1">
          <span className={`px-3 py-1 rounded-full ${
            i === current ? "bg-[#3B28CC] text-white" :
            i < current   ? "bg-[#3B28CC]/10 text-[#3B28CC]" :
                            "bg-gray-100 text-gray-400"
          }`}>
            {s.label}
          </span>
          {i < steps.length - 1 && <span className="text-gray-300">›</span>}
        </div>
      ))}
    </div>
  );
}

function PurpleButton({ children, onClick, disabled }: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{ pointerEvents: disabled ? "none" : "auto" }}
      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all
        ${disabled ? "bg-[#3B28CC]/30 cursor-not-allowed" : "bg-[#3B28CC] hover:bg-[#2d1fb0] active:scale-95"}`}
    >
      {children}
    </button>
  );
}

function GhostButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
                 border border-gray-200 text-gray-500 hover:bg-gray-50 active:scale-95 transition-all"
    >
      {children}
    </button>
  );
}

function ErrorBox({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="flex justify-between gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
      <span>{message}</span>
      <button onClick={onClose} className="text-red-400 hover:text-red-600">✕</button>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}
