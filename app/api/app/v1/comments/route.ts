import { getBearerUserId } from "@/lib/api/auth";
import { failed, json, readJson, unauthorized } from "@/lib/api/respond";
import { addComment } from "@/lib/writes/comments";

// Comments on a painting as the signed-in user, with the website's rules
// (500 characters, 5 per 10 minutes and 50 a day). Body: { paintingId, body }.
// → 201 { comment: { id, paintingId, body } }, body as saved (trimmed).
export async function POST(request: Request) {
  const userId = await getBearerUserId(request);
  if (!userId) return unauthorized();

  const values = await readJson(request);
  const { paintingId, body } =
    values && typeof values === "object" ? (values as { paintingId?: unknown; body?: unknown }) : {};

  const result = await addComment(userId, paintingId, body);
  if (!result.ok) return failed(result);
  return json({ comment: { ...result.comment, paintingId } }, { status: 201 });
}
