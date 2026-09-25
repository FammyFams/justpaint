"use client";

import { useEffect, useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toggleLikeAction } from "@/app/actions/likes";
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

// Account-free heart: the server allows one per painting per IP, and this
// browser remembers what it hearted in localStorage.
function GuestHeartButton({
  paintingId,
  initialCount,
}: {
  paintingId: string;
  initialCount: number;
}) {
  const [hearted, setHearted] = useState(false);
  const [count, setCount] = useState(initialCount);
  const [isPending, startTransition] = useTransition();

  // localStorage only exists in the browser, so read it after hydration.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHearted(readHearted().includes(paintingId));
  }, [paintingId]);

  function handleClick() {
    const next = !hearted;
    setHearted(next);
    setCount((prev) => Math.max(0, prev + (next ? 1 : -1)));
    writeHearted(paintingId, next);

    startTransition(async () => {
      try {
        const result = await setHeartAction(paintingId, next);
        if ("error" in result) throw new Error(result.error);
        setCount(result.count);
      } catch {
        setHearted(!next);
        setCount((prev) => Math.max(0, prev + (next ? -1 : 1)));
        writeHearted(paintingId, !next);
        toast.error("Couldn't save your heart. Try again.");
      }
    });
  }

  return (
    <Button
      variant="outline"
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={hearted}
      aria-label={hearted ? "Remove heart" : "Heart this painting"}
      className="gap-1.5"
    >
      <Heart
        className={cn(
          "size-4 transition-transform",
          hearted && "scale-110 fill-primary text-primary"
        )}
      />
      <span className={cn(hearted ? "text-foreground" : "text-muted-foreground")}>
        {count}
      </span>
    </Button>
  );
}

export function LikeButton({
  paintingId,
  initialCount,
  initialLiked,
  isLoggedIn,
}: {
  paintingId: string;
  initialCount: number;
  initialLiked: boolean;
  isLoggedIn: boolean;
}) {
  if (!isLoggedIn) {
    return <GuestHeartButton paintingId={paintingId} initialCount={initialCount} />;
  }
  return (
    <AccountLikeButton
      paintingId={paintingId}
      initialCount={initialCount}
      initialLiked={initialLiked}
    />
  );
}

// Account-based like (accounts are paused; kept for when they return).
function AccountLikeButton({
  paintingId,
  initialCount,
  initialLiked,
}: {
  paintingId: string;
  initialCount: number;
  initialLiked: boolean;
}) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    const nextLiked = !liked;
    setLiked(nextLiked);
    setCount((prev) => (nextLiked ? prev + 1 : prev - 1));

    startTransition(async () => {
      const result = await toggleLikeAction(paintingId);
      if ("error" in result) {
        // Roll back on failure.
        setLiked(!nextLiked);
        setCount((prev) => (nextLiked ? prev - 1 : prev + 1));
        toast.error("Couldn't update your like. Try again.");
      }
    });
  }

  return (
    <Button
      variant={liked ? "default" : "outline"}
      onClick={handleClick}
      disabled={isPending}
      className="gap-1.5"
    >
      <Heart
        className={cn("size-4 transition-transform", liked && "scale-110 fill-current")}
      />
      {liked ? "Liked" : "Like"}
      <span className={cn(liked ? "text-primary-foreground/80" : "text-muted-foreground")}>
        {count}
      </span>
    </Button>
  );
}
