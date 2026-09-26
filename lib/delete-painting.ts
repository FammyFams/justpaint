import "server-only";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

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
): Promise<{ error: string } | { success: true; ownerId: string | null }> {
  if (!UUID.test(paintingId)) return { error: "That painting no longer exists." };

  const admin = createAdminClient();
  const { data: painting } = await admin
    .from("paintings")
    .select("image_path, owner_id")
    .eq("id", paintingId)
    .maybeSingle();

  if (!painting) return { error: "That painting no longer exists." };
  if (requireOwner && painting.owner_id !== requireOwner) {
    return { error: "You can only delete your own paintings." };
  }

  // Comments, hearts and tag links cascade with the row.
  const { error } = await admin.from("paintings").delete().eq("id", paintingId);
  if (error) {
    console.error("painting delete failed", error);
    return { error: "Couldn't delete that. Try again." };
  }

  // Only remove the file this post owns: its own folder and its own id. An
  // image_path pointing anywhere else is left alone.
  const folder = painting.owner_id ?? "guest";
  if (painting.image_path.startsWith(`${folder}/${paintingId}.`)) {
    await admin.storage.from("paintings").remove([painting.image_path]);
  }

  revalidatePath("/");
  revalidatePath(`/painting/${paintingId}`);
  if (painting.owner_id) revalidatePath(`/artist/${painting.owner_id}`);
  return { success: true, ownerId: painting.owner_id };
}
