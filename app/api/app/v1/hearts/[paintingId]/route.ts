import { getBearerUserId } from "@/lib/api/auth";
import { failed, json, readJson, unauthorized } from "@/lib/api/respond";
import { setHeart } from "@/lib/writes/hearts";

// Hearts or un-hearts a painting for the signed-in user. Body: { hearted }.
// Doing it twice changes nothing. → { hearted, count } with the new total.
export async function PUT(request: Request, { params }: { params: Promise<{ paintingId: string }> }) {
  const userId = await getBearerUserId(request);
  if (!userId) return unauthorized();

  const { paintingId } = await params;
  const body = await readJson(request);
  const hearted = body && typeof body === "object" ? (body as { hearted?: unknown }).hearted : undefined;

  const result = await setHeart(userId, paintingId, hearted);
  if (!result.ok) return failed(result);
  return json({ hearted: result.hearted, count: result.count });
}
