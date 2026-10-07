"use client";

import { useState } from "react";
import Image, { type ImageLoaderProps, type ImageProps } from "next/image";
import { sizedImagePath } from "@/lib/painting-sizes";

// Each painting is stored at 256, 640 and its full size (at most 1600), all
// loaded straight from Supabase (lib/painting-sizes.ts). Those are the only
// widths in next.config.ts, so the browser picks one of the three. Screens
// that ask for more than maxWidth get the maxWidth copy. Nothing goes through
// Vercel's image resizer.
function loaderUpTo(maxWidth: number) {
  return ({ src, width }: ImageLoaderProps) => {
    const w = Math.min(width, maxWidth);
    if (w <= 256) return sizedImagePath(src, 256);
    if (w <= 640) return sizedImagePath(src, 640);
    return src;
  };
}

// A painting image that survives a missing smaller copy: it falls back to the
// stored painting, and only if that fails too shows a message instead of a
// broken image.
export function PaintingImage({
  alt,
  maxWidth = 1600,
  ...props
}: ImageProps & { maxWidth?: number }) {
  const [stage, setStage] = useState<"copy" | "original" | "failed">("copy");

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
      loader={loaderUpTo(maxWidth)}
      unoptimized={stage === "original"}
      onError={() => setStage((s) => (s === "copy" ? "original" : "failed"))}
    />
  );
}
