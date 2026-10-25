"use client";

import { useState } from "react";
import { Milestone } from "@/types";

interface Props {
  milestone: Milestone;
  index: number;
  onUpdate: (id: string, changes: Partial<Milestone>) => void;
}

export default function MilestoneCard({ milestone, index, onUpdate }: Props) {
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(milestone.title);
  const [editDesc, setEditDesc] = useState(milestone.description);

  // Visual style changes based on what the staff member chose
  const cardStyle =
    milestone.status === "accepted" ? "border-emerald-200 bg-emerald-50" :
    milestone.status === "rejected" ? "border-gray-200 bg-gray-50 opacity-50" :
    "border-gray-200 bg-white";

  function saveEdit() {
    onUpdate(milestone.id, {
      title: editTitle.trim(),
      description: editDesc.trim(),
    });
    setEditing(false);
  }

  function cancelEdit() {
    // Reset local edit state back to the current milestone values
    setEditTitle(milestone.title);
    setEditDesc(milestone.description);
    setEditing(false);
  }

  function toggleAccept() {
    onUpdate(milestone.id, {
      status: milestone.status === "accepted" ? "pending" : "accepted",
    });
  }

  function toggleReject() {
    onUpdate(milestone.id, {
      status: milestone.status === "rejected" ? "pending" : "rejected",
    });
  }

  return (
    <div className={`border rounded-2xl p-4 transition-all ${cardStyle}`}>
      <div className="flex items-start gap-3">

        {/* Number bubble */}
        <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
          {index + 1}
        </span>

        {/* Content — either read view or edit form */}
        <div className="flex-1 min-w-0">
          {editing ? (
            <div className="space-y-2">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold
                           focus:outline-none focus:ring-2 focus:ring-[#3B28CC]/20 focus:border-[#3B28CC]"
              />
              <textarea
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
                           focus:outline-none focus:ring-2 focus:ring-[#3B28CC]/20 focus:border-[#3B28CC] resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={saveEdit}
                  className="text-xs px-3 py-1.5 bg-[#3B28CC] text-white rounded-lg font-semibold hover:bg-[#2d1fb0]"
                >
                  Save
                </button>
                <button
                  onClick={cancelEdit}
                  className="text-xs px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg font-semibold hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm font-semibold text-gray-800">{milestone.title}</p>
              <p className="text-sm text-gray-500 mt-1 leading-relaxed">{milestone.description}</p>
            </>
          )}
        </div>

        {/* Action buttons — hidden while editing */}
        {!editing && (
          <div className="flex gap-1 shrink-0">
            <ActionBtn
              label="✅"
              title="Accept"
              active={milestone.status === "accepted"}
              activeClass="bg-emerald-100"
              onClick={toggleAccept}
            />
            <ActionBtn label="✏️" title="Edit" onClick={() => setEditing(true)} />
            <ActionBtn
              label="❌"
              title="Reject"
              active={milestone.status === "rejected"}
              activeClass="bg-red-100"
              onClick={toggleReject}
            />
          </div>
        )}

      </div>
    </div>
  );
}

function ActionBtn({ label, title, onClick, active, activeClass }: {
  label: string;
  title: string;
  onClick: () => void;
  active?: boolean;
  activeClass?: string;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={`w-8 h-8 rounded-lg text-sm flex items-center justify-center transition-all hover:scale-110
        ${active ? activeClass : "bg-gray-100 hover:bg-gray-200"}`}
    >
      {label}
    </button>
  );
}
