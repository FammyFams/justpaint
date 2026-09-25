"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toggleLikeAction } from "@/app/actions/likes";

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
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [isPending, startTransition] = useTransition();

  // Accounts are temporarily disabled, so liking isn't available -- show a
  // plain read-only count instead of a dead-end login redirect.
  if (!isLoggedIn) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground">
        <Heart className="size-4" />
        {count}
      </span>
    );
  }

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
        toast.error("Couldn't update your like — try again.");
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
