"use client";

import { useState } from "react";
import Image, { type ImageLoaderProps, type ImageProps } from "next/image";

// Stored paintings are already WebP at most 1600px wide, so resizing one to
// 1600 only re-made the original (same size, one more of the free plan's
// resizes). The 1600 slot loads the stored file instead; smaller widths go
// through Vercel's resizer like Next's default loader would.
function paintingLoader({ src, width, quality }: ImageLoaderProps) {
  if (width >= 1600) return src;
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality ?? 75}`;
}

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
      loader={paintingLoader}
      unoptimized={stage === "direct"}
      onError={() => setStage((s) => (s === "resized" ? "direct" : "failed"))}
    />
  );
}
