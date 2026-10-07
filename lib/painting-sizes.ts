// Every painting is stored three times, side by side in its folder:
//   alice/<id>.webp       the painting itself (WebP at most 1600px, or a GIF)
//   alice/<id>.640.webp   640px wide, for the wall
//   alice/<id>.256.webp   256px wide, for small thumbnails
// Pages load these files straight from Supabase. Vercel's image resizer is
// never used for paintings: its free plan counts every view of a resized
// copy (300,000 a month), and the wall alone went past that in October 2026.
//
// No imports, so client components, the server and scripts/ can all use it.

export const SMALL_WIDTHS = [640, 256] as const;
export type SmallWidth = (typeof SMALL_WIDTHS)[number];

/** The stored path (or public URL) of a painting's copy at `width`. */
export function sizedImagePath(path: string, width: SmallWidth): string {
  return `${path.replace(/\.[^./]+$/, "")}.${width}.webp`;
}

/** The painting and its copies, e.g. to delete all three. */
export function allImagePaths(path: string): string[] {
  return [path, ...SMALL_WIDTHS.map((w) => sizedImagePath(path, w))];
}
