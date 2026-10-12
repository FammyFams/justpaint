import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import { sizedImagePath } from "@/lib/painting-sizes";

// Pictures for generated share images (next/og). next/og can't read WebP,
// so each painting is shrunk to fit its box and handed over as a JPEG data
// URL. The boxes are at most 620px wide, so the stored 640 copy is enough:
// a fraction of the download and decoding work of the full 1600px file.

export interface OgPicture {
  src: string;
  width: number;
  height: number;
}

async function toDataUrl(
  input: Buffer,
  maxWidth: number,
  maxHeight: number,
  fit: "inside" | "cover" = "inside"
): Promise<OgPicture> {
  const { data, info } = await sharp(input, { limitInputPixels: 40_000_000 })
    .rotate()
    .resize({ width: maxWidth, height: maxHeight, fit })
    .jpeg({ quality: 85 })
    .toBuffer({ resolveWithObject: true });
  return {
    src: `data:image/jpeg;base64,${data.toString("base64")}`,
    width: info.width,
    height: info.height,
  };
}

/** A stored painting (its 640 copy) scaled to fit the box, or null if it can't be loaded. */
export async function paintingPicture(
  url: string,
  maxWidth: number,
  maxHeight: number
): Promise<OgPicture | null> {
  try {
    const res = await fetch(sizedImagePath(url, 640), { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    return await toDataUrl(Buffer.from(await res.arrayBuffer()), maxWidth, maxHeight);
  } catch (error) {
    console.error("share picture: couldn't load painting", url, error);
    return null;
  }
}

/** The hand-drawn dog logo, cropped square like the footer mark. */
export async function logoPicture(size: number): Promise<OgPicture> {
  return toDataUrl(await readFile(join(process.cwd(), "public/logo.jpg")), size, size, "cover");
}

/**
 * next/og only draws PNGs: about 475 KB for a painting's card, 235 KB for a
 * profile's. As a JPEG the card is about 85 KB with no visible difference,
 * and Vercel bills each cached copy by size (ISR writes) and sends it to
 * every site that shows the preview. 4:4:4 keeps the crimson lettering sharp.
 */
export async function asJpeg(card: Response, headers: Record<string, string>): Promise<Response> {
  const data = await sharp(Buffer.from(await card.arrayBuffer()))
    .jpeg({ quality: 85, chromaSubsampling: "4:4:4" })
    .toBuffer();
  return new Response(new Uint8Array(data), { headers: { "content-type": "image/jpeg", ...headers } });
}

/**
 * Headers for a cached share picture (routes with `revalidate = 86400`).
 * next/og sends "max-age=0, must-revalidate" on its own, and Next only adds
 * its cache header when a response has none, so without this Vercel treats
 * every copy as expired and rebuilds the picture on each request. A day,
 * since each rebuild resizes a painting and draws the card (the heaviest
 * server work on the site); deleting a post clears its picture right away.
 */
export const SHARE_PICTURE_HEADERS = {
  "cache-control": "s-maxage=86400, stale-while-revalidate=604800",
};

/**
 * A painting's share picture (route with `revalidate = 2592000`): 30 days,
 * since nothing on it changes by itself. Deletes and admin challenge edits
 * clear it right away.
 */
export const PAINTING_PICTURE_HEADERS = {
  "cache-control": "s-maxage=2592000, stale-while-revalidate=604800",
};
