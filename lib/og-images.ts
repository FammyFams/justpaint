import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

// Pictures for generated share images (next/og). next/og can't read WebP,
// and full-size paintings would make the image slow to build, so each one is
// shrunk to fit its box and handed over as a JPEG data URL.

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

/** A stored painting scaled to fit the box, or null if it can't be loaded. */
export async function paintingPicture(
  url: string,
  maxWidth: number,
  maxHeight: number
): Promise<OgPicture | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
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
 * Headers for a cached share picture (routes with `revalidate = 3600`).
 * next/og sends "max-age=0, must-revalidate" on its own, and Next only adds
 * its cache header when a response has none, so without this Vercel treats
 * every copy as expired and rebuilds the picture on each request.
 */
export const SHARE_PICTURE_HEADERS = {
  "cache-control": "s-maxage=3600, stale-while-revalidate=86400",
};
