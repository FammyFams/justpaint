import "server-only";
import { createHash } from "node:crypto";
import { revalidatePath } from "next/cache";
import sharp from "sharp";
import * as z from "zod";
import { SERVER_BUSY } from "@/lib/busy";
import { visitorKey } from "@/lib/client-ip";
import { deletePaintingRecord } from "@/lib/delete-painting";
import { allImagePaths, sizedImagePath, SMALL_WIDTHS, type SmallWidth } from "@/lib/painting-sizes";
import { makeSmallCopies } from "@/lib/resize-painting";
import { revalidateFeeds } from "@/lib/revalidate";
import { createAdminClient } from "@/lib/supabase/admin";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES, MAX_IMAGE_LABEL } from "@/lib/validations/painting";
import { guestNameSchema } from "@/lib/validations/names";
import { fail, type WriteFailure } from "@/lib/writes/result";

// Posting and deleting paintings, shared by the website's server actions
// (app/actions/paintings.ts) and the app API (app/api/app/v1/paintings), so
// both follow the same rules.

export interface CreatePaintingInput {
  title: string;
  description: string;
  tags: string[];
  aspect: "portrait" | "landscape" | "square";
  image: File;
  guestName?: string;
  /** Covers both the 13+ age confirmation and the Terms agreement. */
  agreedToTerms: boolean;
  /** Entered in the October painting challenge. */
  octoberChallenge?: boolean;
  /** Which day's prompt it's for (1 = October 1). */
  octoberDay?: number;
}

// Server Actions and the app API are public endpoints that accept anything,
// so the input is checked here again rather than trusting the form. The
// database enforces the same limits (migration 20260926000002).
const inputSchema = z.object({
  title: z.string().trim().min(2, "Give it a title.").max(80, "Keep the title under 80 characters."),
  description: z
    .string()
    .trim()
    .min(1, "Add a description.")
    .max(600, "Keep the description under 600 characters."),
  tags: z
    .array(z.string().trim().max(30))
    .min(1, "Pick at least one tag.")
    .max(5, "Pick up to 5 tags."),
  aspect: z.enum(["portrait", "landscape", "square"]),
  guestName: z.string().optional(),
  agreedToTerms: z.literal(true, {
    error: "Confirm you're 13 or older and agree to the Terms of Use.",
  }),
  octoberChallenge: z.boolean().optional(),
  octoberDay: z.number().int().min(1).max(31).optional(),
  image: z
    .instanceof(File, { message: "Add an image." })
    .refine((f) => f.size > 0, "Add an image.")
    .refine((f) => f.size <= MAX_IMAGE_BYTES, `Photo must be ${MAX_IMAGE_LABEL} or smaller.`)
    .refine(
      (f) => (ALLOWED_IMAGE_TYPES as readonly string[]).includes(f.type),
      "File must be a PNG, JPEG, WEBP, or GIF image."
    ),
});

// Caps on what sharp will decode, so a small file that expands into a huge
// image (a "decompression bomb") or an animated GIF with thousands of frames
// can't tie up the server. 40 megapixels covers any phone photo.
const SHARP_LIMITS = { limitInputPixels: 40_000_000 } as const;
const MAX_GIF_FRAMES = 100;

// Re-encodes every upload server-side:
// - No metadata survives. Phone photos often carry GPS coordinates in EXIF,
//   and the browser-side compressor passes some files through untouched.
//   sharp drops all metadata on output by default; .rotate() first bakes the
//   EXIF orientation into the pixels so the photo doesn't come out sideways.
// - Everything is stored as WebP at quality 80, about half the size of the
//   quality-90 JPEGs this used to keep, with no visible difference on
//   paintings. Animated GIFs stay GIFs so they keep moving.
// - Decoding also rejects files that aren't really images, whatever MIME type
//   the browser claimed.
async function reencode(file: File): Promise<{ data: Buffer; contentType: string; ext: string }> {
  const input = Buffer.from(await file.arrayBuffer());
  if (file.type === "image/gif") {
    const data = await sharp(input, { ...SHARP_LIMITS, animated: true, pages: MAX_GIF_FRAMES })
      .gif()
      .toBuffer();
    return { data, contentType: "image/gif", ext: "gif" };
  }
  // The website and the app shrink photos to 1600px first; this catches
  // anything sent without going through them.
  const data = await sharp(input, SHARP_LIMITS)
    .rotate()
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();
  return { data, contentType: "image/webp", ext: "webp" };
}

/**
 * Posts a painting. Uploads go through the service-role client: browser-side
 * roles can't write to storage or the database (migrations 20260925000007,
 * 20260926000002), so this -- and its rate limit -- is the only way in.
 * `ownerId` comes from a verified session, never from the client: signed-in
 * posts belong to the user's profile; without one (website only) it's a
 * guest post with a name.
 */
export async function createPainting(
  ownerId: string | null,
  input: CreatePaintingInput
): Promise<WriteFailure | { ok: true; paintingId: string }> {
  const parsed = inputSchema.safeParse(input);
  if (!parsed.success) {
    return fail("invalid", parsed.error.issues[0]?.message ?? "Check the form and try again.");
  }
  const { title, description, tags, aspect, image } = parsed.data;
  const admin = createAdminClient();

  let guestName: string | undefined;
  if (!ownerId) {
    const name = guestNameSchema.safeParse(parsed.data.guestName ?? "");
    if (!name.success) return fail("invalid", name.error.issues[0]?.message ?? "Add your name.");
    guestName = name.data;

    const { data: taken } = await admin.rpc("display_name_taken", { p_name: guestName });
    if (taken) {
      return fail("taken", "That name belongs to an account. Log in, or use a different name.");
    }
  }

  // Claim the rate-limit slot before decoding, so nobody can make the server
  // decode images without limit. A file that turns out to be unreadable
  // still uses up the slot. Signed-in people are limited per account, guests
  // per IP.
  const { error: slotError } = await admin.rpc("claim_upload_slot", {
    p_ip_hash: await visitorKey(ownerId),
  });
  if (slotError) {
    if (slotError.message.includes("rate_limited_ip")) {
      return fail(
        "rate_limited",
        "You can post 5 paintings every 16 hours. Come back a little later for more."
      );
    }
    if (slotError.message.includes("rate_limited_site")) {
      return fail(
        "busy",
        "The server is busy with lots of uploads right now. Try again in a little while."
      );
    }
    console.error("claim_upload_slot failed", slotError);
    return fail("busy", SERVER_BUSY);
  }

  let cleanImage: Awaited<ReturnType<typeof reencode>>;
  let copies: { width: SmallWidth; data: Buffer }[];
  try {
    cleanImage = await reencode(image);
    copies = await makeSmallCopies(cleanImage.data, SMALL_WIDTHS);
  } catch {
    return fail("invalid", "Couldn't read that image. Try a different file.");
  }

  const paintingId = crypto.randomUUID();
  const path = `${ownerId ?? "guest"}/${paintingId}.${cleanImage.ext}`;

  // The painting and its smaller copies (lib/painting-sizes.ts). Pages and the
  // app load the copies without checking they exist, so it's all three files
  // or no post.
  const files = [
    { path, data: cleanImage.data, contentType: cleanImage.contentType },
    ...copies.map((c) => ({
      path: sizedImagePath(path, c.width),
      data: c.data,
      contentType: "image/webp",
    })),
  ];
  const uploads = await Promise.all(
    files.map((f) =>
      admin.storage
        .from("paintings")
        .upload(f.path, f.data, { contentType: f.contentType, upsert: false })
    )
  );
  const uploadError = uploads.find((u) => u.error)?.error;
  if (uploadError) {
    await admin.storage.from("paintings").remove(allImagePaths(path));
    console.error("storage upload failed", uploadError);
    return fail("busy", "The server is busy and couldn't save your photo. Try again in a few minutes.");
  }

  const { data: rpcData, error: rpcError } = await admin.rpc("create_painting", {
    p_id: paintingId,
    p_title: title,
    p_description: description,
    p_image_path: path,
    p_aspect: aspect,
    p_tag_names: tags,
    p_guest_name: guestName,
    p_owner_id: ownerId ?? undefined,
  });

  if (rpcError) {
    await admin.storage.from("paintings").remove(allImagePaths(path));
    console.error("create_painting failed", rpcError);
    return fail("busy", SERVER_BUSY);
  }

  // Fingerprint of the stored file, so a takedown can also find identical
  // copies (see resolveReportAction in app/actions/reports.ts). The October
  // challenge flag and day are set here too, so create_painting stays
  // unchanged. The painting is already posted, so a failure here doesn't
  // undo it; it's retried once and logged so a missing challenge flag can be
  // fixed by hand.
  const octoberChallenge = parsed.data.octoberChallenge ?? false;
  const extras = {
    image_sha256: createHash("sha256").update(cleanImage.data).digest("hex"),
    october_challenge: octoberChallenge,
    october_day: octoberChallenge ? (parsed.data.octoberDay ?? null) : null,
  };
  let { error: extrasError } = await admin.from("paintings").update(extras).eq("id", paintingId);
  if (extrasError) {
    ({ error: extrasError } = await admin.from("paintings").update(extras).eq("id", paintingId));
  }
  if (extrasError) {
    console.error("post-create update failed", paintingId, extras.october_challenge, extrasError);
  }

  revalidateFeeds();
  if (ownerId) revalidatePath("/artist/[id]", "page");
  return { ok: true, paintingId: rpcData as string };
}

/** Deletes one of the signed-in user's own posts, and its image file. */
export async function deleteOwnPainting(
  userId: string,
  paintingId: unknown
): Promise<WriteFailure | { ok: true }> {
  if (typeof paintingId !== "string") return fail("not_found", "That painting no longer exists.");
  const result = await deletePaintingRecord(paintingId, userId);
  if ("error" in result) return fail(result.code, result.error);
  return { ok: true };
}
