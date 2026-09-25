"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LikeButton({ initialCount }: { initialCount: number }) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(initialCount);

  return (
    <Button
      variant={liked ? "default" : "outline"}
      onClick={() => {
        setLiked((prev) => !prev);
        setCount((prev) => (liked ? prev - 1 : prev + 1));
      }}
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
