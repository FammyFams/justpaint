"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { COMMENT_MAX_LENGTH } from "@/lib/validations/comment";

export function CommentForm({
  onSubmit,
  submitting = false,
}: {
  onSubmit: (body: string) => void;
  submitting?: boolean;
}) {
  const [value, setValue] = useState("");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setValue("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <Textarea
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Say something about this piece..."
        rows={2}
        maxLength={COMMENT_MAX_LENGTH}
        className="resize-none bg-card"
      />
      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={!value.trim() || submitting}>
          {submitting ? "Posting…" : "Post comment"}
        </Button>
      </div>
    </form>
  );
}
