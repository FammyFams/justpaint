import sharp from "sharp";

// Makes the smaller copies of a stored painting (see lib/painting-sizes.ts).
// Used by uploads (lib/writes/paintings.ts) and scripts/backfill-sizes.ts, so
// it only imports sharp: the script runs under plain Node.
//
// The input is the stored file, already cleaned and turned upright. Animated
// GIFs become animated WebPs, so they keep moving on the wall. Quality 75 is
// what Vercel's resizer used. Images narrower than a size stay as they are.
export async function makeSmallCopies<W extends number>(
  stored: Buffer,
  widths: readonly W[]
): Promise<{ width: W; data: Buffer }[]> {
  const copies = [];
  for (const width of widths) {
    const data = await sharp(stored, { limitInputPixels: 40_000_000, animated: true, pages: 100 })
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 75 })
      .toBuffer();
    copies.push({ width, data });
  }
  return copies;
}
