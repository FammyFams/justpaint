"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ALLOWED_IMAGE_TYPES } from "@/lib/validations/painting";

interface CreatePaintingInput {
  title: string;
  description: string;
  tags: string[];
  aspect: "portrait" | "landscape" | "square";
  image: File;
  guestName?: string;
}

export async function createPaintingAction(
  input: CreatePaintingInput
): Promise<{ error: string } | { success: true; paintingId: string }> {
  const title = input.title.trim();
  if (title.length < 2) return { error: "Give it a title." };
  if (!input.image || input.image.size === 0) return { error: "Add an image." };
  if (input.image.size > 10 * 1024 * 1024) {
    return { error: "Image must be 10MB or smaller." };
  }
  if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(input.image.type)) {
    return { error: "File must be a PNG, JPEG, WEBP, or GIF image." };
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub ?? null;

  const guestName = input.guestName?.trim() ?? "";
  if (!userId && guestName.length === 0) {
    return { error: "Add your name." };
  }

  const EXT_BY_MIME: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/webp": "webp",
    "image/gif": "gif",
  };
  const paintingId = crypto.randomUUID();
  const ext = EXT_BY_MIME[input.image.type];
  const path = `${userId ?? "guest"}/${paintingId}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("paintings")
    .upload(path, input.image, { contentType: input.image.type, upsert: false });

  if (uploadError) {
    return { error: `Upload failed: ${uploadError.message}` };
  }

  const tagNames = input.tags.map((t) => t.trim()).filter(Boolean);

  const { data: rpcData, error: rpcError } = await supabase.rpc("create_painting", {
    p_id: paintingId,
    p_title: title,
    p_description: input.description.trim(),
    p_image_path: path,
    p_aspect: input.aspect,
    p_tag_names: tagNames,
    p_guest_name: userId ? undefined : guestName,
  });

  if (rpcError) {
    await supabase.storage.from("paintings").remove([path]);
    return { error: rpcError.message };
  }

  revalidatePath("/");
  if (userId) revalidatePath(`/artist/${userId}`);

  return { success: true, paintingId: rpcData as string };
}
