import { getBearerUserId } from "@/lib/api/auth";
import { failed, json, readJson, unauthorized } from "@/lib/api/respond";
import { blockUser, listBlocks } from "@/lib/writes/blocks";

// Everyone the signed-in user has blocked, newest first.
// → { blocked: [{ id, displayName, blockedAt }] }
export async function GET(request: Request) {
  const userId = await getBearerUserId(request);
  if (!userId) return unauthorized();

  const result = await listBlocks(userId);
  if (!result.ok) return failed(result);
  return json({ blocked: result.blocked });
}

// Blocks an account (their profile id). Body: { userId }. Blocking someone
// already blocked is fine. → 201 { blocked: { id, displayName } }
export async function POST(request: Request) {
  const userId = await getBearerUserId(request);
  if (!userId) return unauthorized();

  const values = await readJson(request);
  const { userId: blockedId } =
    values && typeof values === "object" ? (values as { userId?: unknown }) : {};

  const result = await blockUser(userId, blockedId);
  if (!result.ok) return failed(result);
  return json({ blocked: result.blocked }, { status: 201 });
}
