import "server-only";
import { revalidatePath } from "next/cache";
import sharp from "sharp";
import { avatarStoragePath } from "@/lib/avatar-url";
import { SERVER_BUSY } from "@/lib/busy";
import { createAdminClient } from "@/lib/supabase/admin";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES, MAX_IMAGE_LABEL } from "@/lib/validations/painting";
import { fail, type WriteFailure } from "@/lib/writes/result";

// Profile pictures, shared by the website's server actions
// (app/actions/avatar.ts) and the app API. Each picture is a 256 px square
// WebP at paintings/avatars/{userId}/{random}.webp, about 10 KB. A new file
// name each time means no browser or CDN keeps showing the old one. Browsers
// load it straight from Supabase, so it never uses Vercel's image resizes.

const BUCKET = "paintings";
const SIZE = 256;

// Same decode cap as painting uploads (app/actions/paintings.ts).
const SHARP_LIMITS = { limitInputPixels: 40_000_000 } as const;

const UNREADABLE = "Couldn't read that image. Try a different file.";

function folder(userId: string) {
  return `avatars/${userId}`;
}

/**
 * Cached pages that show this person's picture: every profile page (the
 * same rebuild a new post does), the pages of their paintings, and the
 * pages they commented on. Only these, not the whole site, since everyone
 * changing their picture at once shouldn't empty the cache.
 */
async function revalidateAvatarPages(userId: string) {
  revalidatePath("/artist/[id]", "page");
  const admin = createAdminClient();
  const [posts, comments] = await Promise.all([
    admin.from("paintings").select("id").eq("owner_id", userId),
    admin.from("comments").select("painting_id").eq("user_id", userId),
  ]);
  const ids = new Set([
    ...(posts.data ?? []).map((p) => p.id),
    ...(comments.data ?? []).map((c) => c.painting_id),
  ]);
  for (const id of ids) revalidatePath(`/painting/${id}`);
}

async function currentPath(userId: string): Promise<string | null> {
  const { data } = await createAdminClient()
    .from("profiles")
    .select("avatar_url")
    .eq("id", userId)
    .maybeSingle();
  const path = avatarStoragePath(data?.avatar_url);
  return path?.startsWith(`${folder(userId)}/`) ? path : null;
}

/**
 * Sets the signed-in user's picture. Any photo works: it's turned upright,
 * cropped to the middle square and shrunk, and like painting uploads, no
 * metadata (phone GPS) survives the re-encode.
 */
export async function setAvatar(
  userId: string,
  // Checked here: a PNG, JPEG, WebP or GIF file up to 4 MB.
  image: unknown
): Promise<WriteFailure | { ok: true; avatarUrl: string }> {
  if (!(image instanceof File) || image.size === 0) return fail("invalid", "Choose a photo.");
  if (image.size > MAX_IMAGE_BYTES) {
    return fail("invalid", `Photo must be ${MAX_IMAGE_LABEL} or smaller.`);
  }
  if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(image.type)) {
    return fail("invalid", "File must be a PNG, JPEG, WEBP, or GIF image.");
  }

  let data: Buffer;
  try {
    // GIFs keep only their first frame.
    data = await sharp(Buffer.from(await image.arrayBuffer()), SHARP_LIMITS)
      .rotate()
      .resize(SIZE, SIZE, { fit: "cover" })
      .webp({ quality: 80 })
      .toBuffer();
  } catch {
    return fail("invalid", UNREADABLE);
  }

  const admin = createAdminClient();
  const oldPath = await currentPath(userId);
  const path = `${folder(userId)}/${crypto.randomUUID()}.webp`;

  const { error: uploadError } = await admin.storage
    .from(BUCKET)
    .upload(path, data, { contentType: "image/webp", upsert: false });
  if (uploadError) {
    console.error("avatar upload failed", uploadError);
    return fail("busy", SERVER_BUSY);
  }

  const avatarUrl = admin.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  const { error } = await admin
    .from("profiles")
    .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
    .eq("id", userId);
  if (error) {
    await admin.storage.from(BUCKET).remove([path]);
    console.error("avatar save failed", error);
    return fail("busy", SERVER_BUSY);
  }

  if (oldPath) await admin.storage.from(BUCKET).remove([oldPath]);
  await revalidateAvatarPages(userId);
  return { ok: true, avatarUrl };
}

/** Back to initials. */
export async function removeAvatar(userId: string): Promise<WriteFailure | { ok: true }> {
  const admin = createAdminClient();
  const oldPath = await currentPath(userId);

  const { error } = await admin
    .from("profiles")
    .update({ avatar_url: null, updated_at: new Date().toISOString() })
    .eq("id", userId);
  if (error) {
    console.error("avatar remove failed", error);
    return fail("busy", SERVER_BUSY);
  }

  if (oldPath) await admin.storage.from(BUCKET).remove([oldPath]);
  await revalidateAvatarPages(userId);
  return { ok: true };
}

/**
 * Deletes every picture file in the user's folder, for account deletion.
 * The profile row goes with the account, but files in Storage don't.
 */
export async function removeAvatarFiles(userId: string): Promise<void> {
  const admin = createAdminClient();
  const { data } = await admin.storage.from(BUCKET).list(folder(userId));
  const paths = (data ?? []).map((file) => `${folder(userId)}/${file.name}`);
  if (paths.length) await admin.storage.from(BUCKET).remove(paths);
}
