"use client";

import { useState } from "react";
import { toast } from "sonner";
import { adminSetOctoberChallengeAction } from "@/app/actions/admin";
import { PROMPTS } from "@/lib/october-challenge";

// The October box, plus a day picker once it's ticked. Each change saves
// right away.
export function AdminChallengeCheckbox({
  paintingId,
  initialChecked,
  initialDay,
}: {
  paintingId: string;
  initialChecked: boolean;
  initialDay: number | null;
}) {
  const [checked, setChecked] = useState(initialChecked);
  const [day, setDay] = useState(initialDay);
  const [saving, setSaving] = useState(false);

  async function save(nextChecked: boolean, nextDay: number | null) {
    const before = { checked, day };
    setChecked(nextChecked);
    setDay(nextDay);
    setSaving(true);
    try {
      const result = await adminSetOctoberChallengeAction(paintingId, nextChecked, nextDay);
      if ("error" in result) {
        toast.error(result.error);
        setChecked(before.checked);
        setDay(before.day);
      }
    } catch {
      toast.error("Couldn't save that. Check your connection and try again.");
      setChecked(before.checked);
      setDay(before.day);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex shrink-0 flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-2">
      <label className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <input
          type="checkbox"
          checked={checked}
          disabled={saving}
          // Unticking clears the day, as the server does.
          onChange={(e) => save(e.target.checked, e.target.checked ? day : null)}
          className="size-4 accent-primary"
        />
        October
      </label>
      {checked && (
        <select
          aria-label="Challenge day"
          value={day ?? ""}
          disabled={saving}
          onChange={(e) => save(true, e.target.value ? Number(e.target.value) : null)}
          className="h-7 max-w-32 rounded-md border border-input bg-transparent px-1.5 text-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="">No day</option>
          {PROMPTS.map((prompt, i) => (
            <option key={i} value={i + 1}>
              {i + 1}: {prompt}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
