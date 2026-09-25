"use server";

import { createHmac } from "node:crypto";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { ALLOWED_IMAGE_TYPES } from "@/lib/validations/painting";

interface CreatePaintingInput {
  title: string;
  description: string;
  tags: string[];
  aspect: "portrait" | "landscape" | "square";
  image: File;
  guestName?: string;
  over13: boolean;
  agreedToTerms: boolean;
}

const EXT_BY_MIME: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

async function hashedClientIp(): Promise<string> {
  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "unknown";
  // Salted so the stored value can't be reversed to an IP by brute force.
  return createHmac("sha256", process.env.SUPABASE_SECRET_KEY!)
    .update(ip)
    .digest("hex");
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
  if (input.over13 !== true) return { error: "You must be 13 or older to post." };
  if (input.agreedToTerms !== true) {
    return { error: "Please agree to the Terms of Use." };
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

  const admin = createAdminClient();

  const { error: slotError } = await admin.rpc("claim_upload_slot", {
    p_ip_hash: await hashedClientIp(),
  });
  if (slotError) {
    if (slotError.message.includes("rate_limited_ip")) {
      return {
        error: "You can post 3 paintings a day — come back tomorrow for more.",
      };
    }
    if (slotError.message.includes("rate_limited_site")) {
      return { error: "Lots of uploads right now — try again in a little while." };
    }
    return { error: "Couldn't start the upload — try again." };
  }

  const paintingId = crypto.randomUUID();
  const path = `guest/${paintingId}.${EXT_BY_MIME[input.image.type]}`;

  const { error: uploadError } = await admin.storage
    .from("paintings")
    .upload(path, input.image, { contentType: input.image.type, upsert: false });
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
