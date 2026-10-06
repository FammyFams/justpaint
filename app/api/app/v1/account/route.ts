import { getBearerUserId } from "@/lib/api/auth";
import { failed, json, unauthorized } from "@/lib/api/respond";
import { deleteAccount } from "@/lib/writes/account";

// Deletes the signed-in user's account, paintings, comments and hearts. The
// app signs itself out after a 200.
export async function DELETE(request: Request) {
  const userId = await getBearerUserId(request);
  if (!userId) return unauthorized();

  const result = await deleteAccount(userId);
  if (!result.ok) return failed(result);
  return json({ deleted: true });
}
