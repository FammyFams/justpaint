"use server";

import { createHash } from "node:crypto";
import { revalidatePath } from "next/cache";
import sharp from "sharp";
import * as z from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { visitorKey } from "@/lib/client-ip";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES, MAX_IMAGE_LABEL } from "@/lib/validations/painting";
import { guestNameSchema } from "@/lib/validations/names";
import { deletePaintingRecord } from "@/lib/delete-painting";

interface CreatePaintingInput {
  title: string;
  description: string;
  tags: string[];
  aspect: "portrait" | "landscape" | "square";
  image: File;
  guestName?: string;
  /** Covers both the 13+ age confirmation and the Terms agreement. */
  agreedToTerms: boolean;
}

// Server Actions are public endpoints that accept any arguments, so the input
// is checked here again rather than trusting the upload form. The database
// enforces the same limits (migration 20260926000002).
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
  // The browser already shrinks photos to 1600px (lib/compress-image.ts);
  // this catches anything sent without going through the upload form.
  const data = await sharp(input, SHARP_LIMITS)
    .rotate()
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();
  return { data, contentType: "image/webp", ext: "webp" };
}

async function sessionUserId(): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  return data?.claims?.sub ?? null;
}

// Uploads go through the service-role client: browser-side roles can't write
// to storage or the database (migrations 20260925000007, 20260926000002), so
// this action -- and its rate limit -- is the only way in. Signed-in uploads
// belong to the user's profile; everyone else posts as a guest with a name.
export async function createPaintingAction(
  input: CreatePaintingInput
): Promise<{ error: string } | { success: true; paintingId: string }> {
  const parsed = inputSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  }
  const { title, description, tags, aspect, image } = parsed.data;

  // The owner comes from the verified session, never from the client.
  const ownerId = await sessionUserId();
  const admin = createAdminClient();

  let guestName: string | undefined;
  if (!ownerId) {
    const name = guestNameSchema.safeParse(parsed.data.guestName ?? "");
    if (!name.success) return { error: name.error.issues[0]?.message ?? "Add your name." };
    guestName = name.data;

    const { data: taken } = await admin.rpc("display_name_taken", { p_name: guestName });
    if (taken) {
      return { error: "That name belongs to an account. Log in, or use a different name." };
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
      return {
        error: "You can post 5 paintings every 16 hours. Come back a little later for more.",
      };
    }
    if (slotError.message.includes("rate_limited_site")) {
      return { error: "Lots of uploads right now. Try again in a little while." };
    }
    console.error("claim_upload_slot failed", slotError);
    return { error: "Couldn't start the upload. Try again." };
  }

  let cleanImage: Awaited<ReturnType<typeof reencode>>;
  try {
    cleanImage = await reencode(image);
  } catch {
    return { error: "Couldn't read that image. Try a different file." };
  }

  const paintingId = crypto.randomUUID();
  const path = `${ownerId ?? "guest"}/${paintingId}.${cleanImage.ext}`;

  const { error: uploadError } = await admin.storage
    .from("paintings")
    .upload(path, cleanImage.data, { contentType: cleanImage.contentType, upsert: false });
  if (uploadError) {
    console.error("storage upload failed", uploadError);
    return { error: "Upload failed. Try again." };
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
    await admin.storage.from("paintings").remove([path]);
    console.error("create_painting failed", rpcError);
    return { error: "Couldn't save your painting. Try again." };
  }

  // Fingerprint of the stored file, so a takedown can also find identical
  // copies (see resolveReportAction in app/actions/reports.ts).
  await admin
    .from("paintings")
    .update({ image_sha256: createHash("sha256").update(cleanImage.data).digest("hex") })
    .eq("id", paintingId);

  revalidatePath("/");
  if (ownerId) revalidatePath(`/artist/${ownerId}`);
  return { success: true, paintingId: rpcData as string };
}

/** Lets a signed-in user delete one of their own posts. */
export async function deleteOwnPaintingAction(
  paintingId: string
): Promise<{ error: string } | { success: true }> {
  const userId = await sessionUserId();
  if (!userId) return { error: "Log in to delete your paintings." };

  const result = await deletePaintingRecord(paintingId, userId);
  return "error" in result ? result : { success: true };
}
