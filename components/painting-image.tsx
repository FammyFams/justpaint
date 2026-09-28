"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";

// A painting image that survives Vercel's image resizer failing, e.g. after
// the free plan's 5,000 resizes a month run out. It first falls back to the
// stored file straight from Supabase (already WebP, at most 1600px), and only
// if that fails too shows a message instead of a broken image.
export function PaintingImage({ alt, ...props }: ImageProps) {
  const [stage, setStage] = useState<"resized" | "direct" | "failed">("resized");

  if (stage === "failed") {
    return (
      <div
        className={`flex items-center justify-center p-4 text-center text-xs text-muted-foreground ${
          props.fill ? "absolute inset-0" : "aspect-[4/3] w-full"
        }`}
      >
        This painting can&apos;t load right now. The server is busy, try again later.
      </div>
    );
  }

  return (
    <Image
      {...props}
      alt={alt}
      unoptimized={stage === "direct"}
      onError={() => setStage((s) => (s === "resized" ? "direct" : "failed"))}
    />
  );
}
