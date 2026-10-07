import { getBearerUserId } from "@/lib/api/auth";
import { json, unauthorized } from "@/lib/api/respond";
import { getNotifications, getUnreadCount } from "@/lib/notifications";
import { sizedImagePath } from "@/lib/painting-sizes";

// The signed-in user's notifications, the same list as the website's
// /notifications (lib/notifications.ts): comments on their paintings and
// hearts grouped per painting per day, the last 30 days, newest first, 50 at
// most.
//   GET /api/app/v1/notifications        → { items, seenAt }
//   GET /api/app/v1/notifications?count  → { unreadCount }, for the tab badge:
//                                           one database call, cheap enough to
//                                           ask whenever the app comes back
// An item is new when its `at` is after `seenAt`. Each painting has imageUrl
// (the stored file) and thumbUrl (its 256px copy, lib/painting-sizes.ts).
// Asking marks nothing seen; POST /notifications/seen does that.
export async function GET(request: Request) {
  const userId = await getBearerUserId(request);
  if (!userId) return unauthorized();

  if (new URL(request.url).searchParams.has("count")) {
    return json({ unreadCount: await getUnreadCount(userId) });
  }

  const { items, seenAt } = await getNotifications(userId);
  return json({
    items: items.map((item) => ({
      ...item,
      painting: { ...item.painting, thumbUrl: sizedImagePath(item.painting.imageUrl, 256) },
    })),
    seenAt,
  });
}
