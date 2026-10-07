import { getBearerUserId } from "@/lib/api/auth";
import { failed, json, unauthorized } from "@/lib/api/respond";
import { unblockUser } from "@/lib/writes/blocks";

// Unblocks an account. Unblocking someone who isn't blocked is fine.
// → { unblocked: true }
export async function DELETE(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  const userId = await getBearerUserId(request);
  if (!userId) return unauthorized();

  const { userId: blockedId } = await params;
  const result = await unblockUser(userId, blockedId);
  if (!result.ok) return failed(result);
  return json({ unblocked: true });
}
