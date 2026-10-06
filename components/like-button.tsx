"use client";

import { useEffect, useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useViewer } from "@/components/viewer";
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
// the server counts per account and the hearts come with the account
// (components/viewer.tsx), so they show the same on every device.
function HeartButton({
  paintingId,
  initialCount,
  compact,
}: {
  paintingId: string;
  /** The page's count. Cached pages can be a few minutes behind. */
  initialCount: number;
  /** Small ghost-style heart for feed cards. */
  compact?: boolean;
}) {
  const viewer = useViewer();
  const member = viewer.user !== null;
  const [remembered, setRemembered] = useState(false);
  const [isPending, startTransition] = useTransition();
  const hearted = member ? viewer.hearted.has(paintingId) : remembered;
  // A heart given this visit (here or on another copy of this card) knows
  // the newest count.
  const count = viewer.heartCounts.get(paintingId) ?? initialCount;

  // localStorage only exists in the browser, so read it after hydration.
  useEffect(() => {
    if (member) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRemembered(readHearted().includes(paintingId));
  }, [paintingId, member]);

  function show(on: boolean, newCount: number) {
    viewer.setHeart(paintingId, on, newCount);
    if (!member) {
      setRemembered(on);
      writeHearted(paintingId, on);
    }
  }

  function handleClick() {
    // Ignored rather than disabled while saving: disabling the focused
    // button would drop keyboard focus to the top of the page.
    if (isPending) return;
    const next = !hearted;
    const before = count;
    show(next, Math.max(0, before + (next ? 1 : -1)));

    startTransition(async () => {
      try {
        const result = await setHeartAction(paintingId, next);
        if ("error" in result) throw new Error(result.error);
        viewer.setHeart(paintingId, next, result.count);
      } catch {
        show(!next, before);
        toast.error("The server is busy and couldn't save your heart. Try again later.");
      }
    });
  }

  return (
    <Button
      variant={compact ? "ghost" : "outline"}
      size={compact ? "sm" : "default"}
      onClick={handleClick}
      // Same name either way (aria-pressed says whether it's on). It has to
      // include the visible count: WCAG asks that a name contain what's shown.
      aria-pressed={hearted}
      aria-label={`Heart this painting, ${count} ${count === 1 ? "heart" : "hearts"}`}
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
