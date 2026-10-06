import { getBearerUserId } from "@/lib/api/auth";
import { failed, json, readJson, unauthorized } from "@/lib/api/respond";
import { updateProfile } from "@/lib/writes/account";

// Edits the signed-in user's name and bio. Body: { displayName, bio? }.
export async function PATCH(request: Request) {
  const userId = await getBearerUserId(request);
  if (!userId) return unauthorized();

  const result = await updateProfile(userId, await readJson(request));
  if (!result.ok) return failed(result);
  return json({ profile: result.profile });
}
