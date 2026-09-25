"use server";

import { revalidatePath } from "next/cache";
import sharp from "sharp";
import { createAdminClient } from "@/lib/supabase/admin";
import { hashedClientIp } from "@/lib/client-ip";
import { ALLOWED_IMAGE_TYPES } from "@/lib/validations/painting";

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

const EXT_BY_MIME: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

// Re-encodes the image server-side so no metadata survives -- phone photos
// often carry GPS coordinates in EXIF, and the browser-side compressor passes
// some files through untouched. sharp drops all metadata on output by default;
// .rotate() first bakes the EXIF orientation into the pixels so the photo
// doesn't come out sideways. Decoding also rejects files that aren't really
// images, whatever MIME type the browser claimed.
async function stripMetadata(file: File): Promise<Buffer> {
  const input = Buffer.from(await file.arrayBuffer());
  if (file.type === "image/gif") {
    return sharp(input, { animated: true }).gif().toBuffer();
  }
  const image = sharp(input).rotate();
  switch (file.type) {
    case "image/png":
      return image.png().toBuffer();
    case "image/webp":
      return image.webp({ quality: 90 }).toBuffer();
    default:
      return image.jpeg({ quality: 90, mozjpeg: true }).toBuffer();
  }
}

// Uploads go through the service-role client: browser-side roles have no
// storage-upload or create_painting permission (see migration
// 20260925000007), so this action -- and its rate limit -- is the only way in.
// Accounts are paused, so every upload is a guest upload.
export async function createPaintingAction(
  input: CreatePaintingInput
): Promise<{ error: string } | { success: true; paintingId: string }> {
  const title = input.title.trim();
  if (title.length < 2) return { error: "Give it a title." };
  if (input.description.trim().length === 0) {
    return { error: "Add a description." };
  }
  if (!input.tags.some((t) => t.trim())) return { error: "Pick at least one tag." };
  if (input.agreedToTerms !== true) {
    return { error: "Confirm you're 13 or older and agree to the Terms of Use." };
  }
  if (!input.image || input.image.size === 0) return { error: "Add an image." };
  if (input.image.size > 10 * 1024 * 1024) {
    return { error: "Image must be 10MB or smaller." };
  }
  if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(input.image.type)) {
    return { error: "File must be a PNG, JPEG, WEBP, or GIF image." };
  }

  const guestName = input.guestName?.trim() ?? "";
  if (guestName.length === 0) return { error: "Add your name." };

  // Before claiming a rate-limit slot, so an unreadable file doesn't use one up.
  let cleanImage: Buffer;
  try {
    cleanImage = await stripMetadata(input.image);
  } catch {
    return { error: "Couldn't read that image. Try a different file." };
  }

  const admin = createAdminClient();

  const { error: slotError } = await admin.rpc("claim_upload_slot", {
    p_ip_hash: await hashedClientIp(),
  });
  if (slotError) {
    if (slotError.message.includes("rate_limited_ip")) {
      return {
        error: "You can post 3 paintings a day. Come back tomorrow for more.",
      };
    }
    if (slotError.message.includes("rate_limited_site")) {
      return { error: "Lots of uploads right now. Try again in a little while." };
    }
    return { error: "Couldn't start the upload. Try again." };
  }

  const paintingId = crypto.randomUUID();
  const path = `guest/${paintingId}.${EXT_BY_MIME[input.image.type]}`;

  const { error: uploadError } = await admin.storage
    .from("paintings")
    .upload(path, cleanImage, { contentType: input.image.type, upsert: false });
  if (uploadError) {
    return { error: `Upload failed: ${uploadError.message}` };
  }

  const { data: rpcData, error: rpcError } = await admin.rpc("create_painting", {
    p_id: paintingId,
    p_title: title,
    p_description: input.description.trim(),
    p_image_path: path,
    p_aspect: input.aspect,
    p_tag_names: input.tags.map((t) => t.trim()).filter(Boolean),
    p_guest_name: guestName,
  });

  if (rpcError) {
    await admin.storage.from("paintings").remove([path]);
    return { error: rpcError.message };
  }

  revalidatePath("/");
  return { success: true, paintingId: rpcData as string };
}
