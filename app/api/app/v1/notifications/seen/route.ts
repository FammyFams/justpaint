import { getBearerUserId } from "@/lib/api/auth";
import { busy, failed, json, readJson, unauthorized } from "@/lib/api/respond";
import { getUnreadCount, markNotificationTapped, markNotificationsSeen } from "@/lib/notifications";

// Marks notifications seen.
//   POST /api/app/v1/notifications/seen  { id }  the one the user tapped (the
//        item's id from GET /notifications); TAP_MARKS in lib/notifications.ts
//        decides whether that also covers the rest of its painting
//   POST /api/app/v1/notifications/seen  {}      all of them, for a "mark all
//        as read" button
// → { unreadCount }, the new badge count.
export async function POST(request: Request) {
  const userId = await getBearerUserId(request);
  if (!userId) return unauthorized();

  const body = await readJson(request);
  const id = body && typeof body === "object" && "id" in body ? body.id : undefined;

  if (id !== undefined) {
    if (typeof id !== "string") return failed({ ok: false, code: "invalid", error: "That isn't a notification." });
    const result = await markNotificationTapped(userId, id);
    if (!result.ok) return failed(result);
    return json({ unreadCount: result.unreadCount });
  }

  if (!(await markNotificationsSeen(userId))) return busy();
  return json({ unreadCount: await getUnreadCount(userId) });
}
