"use client";

import { useState } from "react";
import { toast } from "sonner";
import { adminSetChallengeAction } from "@/app/actions/admin";
import { CHALLENGES, challengeById, promptFor } from "@/lib/challenges";

const SELECT =
  "h-7 max-w-32 rounded-md border border-input bg-transparent px-1.5 text-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

// Which challenge a post is in, plus a day picker once one is picked. Each
// change saves right away.
export function AdminChallengeCheckbox({
  paintingId,
  initialChallenge,
  initialDay,
}: {
  paintingId: string;
  initialChallenge: string | null;
  initialDay: number | null;
}) {
  const [challengeId, setChallengeId] = useState(initialChallenge);
  const [day, setDay] = useState(initialDay);
  const [saving, setSaving] = useState(false);
  const challenge = challengeById(challengeId);

  async function save(nextChallenge: string | null, nextDay: number | null) {
    const before = { challengeId, day };
    setChallengeId(nextChallenge);
    setDay(nextDay);
    setSaving(true);
    try {
      const result = await adminSetChallengeAction(paintingId, nextChallenge, nextDay);
      if ("error" in result) {
        toast.error(result.error);
        setChallengeId(before.challengeId);
        setDay(before.day);
      }
    } catch {
      toast.error("Couldn't save that. Check your connection and try again.");
      setChallengeId(before.challengeId);
      setDay(before.day);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex shrink-0 flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-2">
      <select
        aria-label="Challenge"
        value={challengeId ?? ""}
        disabled={saving}
        // A new challenge starts with no day, as does taking it out.
        onChange={(e) => save(e.target.value || null, null)}
        className={SELECT}
      >
        <option value="">No challenge</option>
        {CHALLENGES.map((c) => (
          <option key={c.id} value={c.id}>
            {c.month}
          </option>
        ))}
      </select>
      {challenge && (
        <select
          aria-label="Challenge day"
          value={day ?? ""}
          disabled={saving}
          onChange={(e) => save(challenge.id, e.target.value ? Number(e.target.value) : null)}
          className={SELECT}
        >
          <option value="">No day</option>
          {challenge.prompts.map((_, i) => {
            const prompt = promptFor(challenge, i + 1);
            return (
              <option key={i} value={i + 1}>
                {prompt ? `${i + 1}: ${prompt}` : `${i + 1}`}
              </option>
            );
          })}
        </select>
      )}
    </div>
  );
}
