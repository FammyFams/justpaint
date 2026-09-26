"use client";

import { useEffect, useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { setHeartAction } from "@/app/actions/hearts";

const HEARTED_KEY = "jp_hearted";

function readHearted(): string[] {
  try {
    const value = JSON.parse(localStorage.getItem(HEARTED_KEY) ?? "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function writeHearted(paintingId: string, hearted: boolean) {
  try {
    const rest = readHearted().filter((id) => id !== paintingId);
    localStorage.setItem(
      HEARTED_KEY,
      JSON.stringify(hearted ? [...rest, paintingId] : rest)
    );
  } catch {
    // Storage blocked (private mode etc.) -- the heart still counts server-side.
  }
}

// One heart per painting per visitor. For guests the server counts per IP and
// this browser remembers what it hearted in localStorage. For signed-in users
// the server counts per account and the page passes initialHearted, so their
// hearts show the same on every device.
function HeartButton({
  paintingId,
  initialCount,
  initialHearted,
  compact,
}: {
  paintingId: string;
  initialCount: number;
  /** Set for signed-in users (from the server); guests leave it undefined. */
  initialHearted?: boolean;
  /** Small ghost-style heart for feed cards. */
  compact?: boolean;
}) {
  const isGuest = initialHearted === undefined;
  const [hearted, setHearted] = useState(initialHearted ?? false);
  const [count, setCount] = useState(initialCount);
  const [isPending, startTransition] = useTransition();

  // localStorage only exists in the browser, so read it after hydration.
  useEffect(() => {
    if (!isGuest) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHearted(readHearted().includes(paintingId));
  }, [paintingId, isGuest]);

  function handleClick() {
    const next = !hearted;
    setHearted(next);
    setCount((prev) => Math.max(0, prev + (next ? 1 : -1)));
    if (isGuest) writeHearted(paintingId, next);

    startTransition(async () => {
      try {
        const result = await setHeartAction(paintingId, next);
        if ("error" in result) throw new Error(result.error);
        setCount(result.count);
      } catch {
        setHearted(!next);
        setCount((prev) => Math.max(0, prev + (next ? -1 : 1)));
        if (isGuest) writeHearted(paintingId, !next);
        toast.error("Couldn't save your heart. Try again.");
      }
    });
  }

  return (
    <Button
      variant={compact ? "ghost" : "outline"}
      size={compact ? "sm" : "default"}
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={hearted}
      aria-label={hearted ? "Remove heart" : "Heart this painting"}
      className={compact ? "-mr-1.5 gap-1 px-1.5 text-xs" : "gap-1.5"}
    >
      <Heart
        className={cn(
          compact ? "size-3.5 transition-transform" : "size-4 transition-transform",
          hearted && "scale-110 fill-primary text-primary"
        )}
      />
      <span className={cn(hearted ? "text-foreground" : "text-muted-foreground")}>
        {count}
      </span>
    </Button>
  );
}

export const LikeButton = HeartButton;
