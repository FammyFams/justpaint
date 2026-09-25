"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

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
