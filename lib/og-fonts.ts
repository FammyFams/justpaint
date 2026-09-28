import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Plus Jakarta Sans (the site font) for generated pictures: share cards and
// the challenge calendar. next/og can't use next/font, so it reads the static
// files in assets/fonts. Use fontFamily "Jakarta".
const FILES = [
  { file: "PlusJakartaSans-Medium.ttf", weight: 500, style: "normal" },
  { file: "PlusJakartaSans-Bold.ttf", weight: 700, style: "normal" },
  { file: "PlusJakartaSans-ExtraBold.ttf", weight: 800, style: "normal" },
  { file: "PlusJakartaSans-SemiBoldItalic.ttf", weight: 600, style: "italic" },
] as const;

export async function jakartaFonts() {
  return Promise.all(
    FILES.map(async ({ file, weight, style }) => ({
      name: "Jakarta",
      data: await readFile(join(process.cwd(), "assets/fonts", file)),
      weight,
      style,
    }))
  );
}
