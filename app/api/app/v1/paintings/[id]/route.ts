import { getBearerUserId } from "@/lib/api/auth";
import { failed, json, unauthorized } from "@/lib/api/respond";
import { deleteOwnPainting } from "@/lib/writes/paintings";

// Deletes one of the signed-in user's own paintings, with its comments,
// hearts and image file. Someone else's → 403. → { deleted: true }
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getBearerUserId(request);
  if (!userId) return unauthorized();

  const { id } = await params;
  const result = await deleteOwnPainting(userId, id);
  if (!result.ok) return failed(result);
  return json({ deleted: true });
}
