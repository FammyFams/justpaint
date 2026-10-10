import "server-only";
import { revalidatePath } from "next/cache";
import { allImagePaths } from "@/lib/painting-sizes";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidateFeeds, revalidateProfileById } from "@/lib/revalidate";
import type { FailureCode } from "@/lib/writes/result";

// Not a Server Action: this lives outside app/actions and is server-only, so
// the browser can't call it directly. Callers must check who's asking first.

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Deletes a post and its image file. Used by signed-in users for their own
 * posts (ownership checked here, on the server) and by the admin for any post.
 */
export async function deletePaintingRecord(
  paintingId: string,
  requireOwner: string | null
): Promise<
  // code: for the app API's HTTP status (lib/writes/result.ts).
  { error: string; code: FailureCode } | { success: true; ownerId: string | null }
> {
  const gone = { error: "That painting no longer exists.", code: "not_found" } as const;
  if (!UUID.test(paintingId)) return gone;

  const admin = createAdminClient();
  const { data: painting } = await admin
    .from("paintings")
    .select("image_path, owner_id")
    .eq("id", paintingId)
    .maybeSingle();

  if (!painting) return gone;
  if (requireOwner && painting.owner_id !== requireOwner) {
    return { error: "You can only delete your own paintings.", code: "forbidden" };
  }

  // Comments, hearts and tag links cascade with the row.
  const { error } = await admin.from("paintings").delete().eq("id", paintingId);
  if (error) {
    console.error("painting delete failed", error);
    return { error: "Couldn't delete that. Try again.", code: "busy" };
  }

  // Only remove the files this post owns: its own folder and its own id. An
  // image_path pointing anywhere else is left alone. The smaller copies sit
  // next to it (lib/painting-sizes.ts).
  const folder = painting.owner_id ?? "guest";
  if (painting.image_path.startsWith(`${folder}/${paintingId}.`)) {
    await admin.storage.from("paintings").remove(allImagePaths(painting.image_path));
  }

  revalidateFeeds();
  revalidatePath(`/painting/${paintingId}`);
  // Share pictures are cached for weeks; drop this one now so a removed
  // painting stops showing up in link previews.
  revalidatePath(`/painting/${paintingId}/opengraph-image`);
  // Also the profile's share picture, which shows the latest paintings.
  if (painting.owner_id) await revalidateProfileById(painting.owner_id);
  return { success: true, ownerId: painting.owner_id };
}
