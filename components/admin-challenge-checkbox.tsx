"use client";

import { useState } from "react";
import { toast } from "sonner";
import { adminSetOctoberChallengeAction } from "@/app/actions/admin";

export function AdminChallengeCheckbox({
  paintingId,
  initialChecked,
}: {
  paintingId: string;
  initialChecked: boolean;
}) {
  const [checked, setChecked] = useState(initialChecked);
  const [saving, setSaving] = useState(false);

  async function handleChange(next: boolean) {
    setChecked(next);
    setSaving(true);
    try {
      const result = await adminSetOctoberChallengeAction(paintingId, next);
      if ("error" in result) {
        toast.error(result.error);
        setChecked(!next);
      }
    } catch {
      toast.error("Couldn't save that. Check your connection and try again.");
      setChecked(!next);
    } finally {
      setSaving(false);
    }
  }

  return (
    <label className="flex shrink-0 items-center gap-1.5 text-sm text-muted-foreground">
      <input
        type="checkbox"
        checked={checked}
        disabled={saving}
        onChange={(e) => handleChange(e.target.checked)}
        className="size-4 accent-primary"
      />
      October
    </label>
  );
}
