"use server";

import { getSessionUserId } from "@/lib/current-user";
import { markNotificationTapped } from "@/lib/notifications";

// Called when a notification on /notifications is clicked; opening the page
// marks nothing (lib/notifications.ts, TAP_MARKS). The new unread count for
// the account menu, or null if it wasn't saved.
export async function markNotificationTappedAction(itemId: string): Promise<number | null> {
  const userId = await getSessionUserId();
  if (!userId || typeof itemId !== "string") return null;
  const result = await markNotificationTapped(userId, itemId);
  return result.ok ? result.unreadCount : null;
}
