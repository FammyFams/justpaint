"use server";

import { getSessionUserId } from "@/lib/current-user";
import { markNotificationsSeen } from "@/lib/notifications";

// Called from /notifications once the page is on screen (not while it
// renders, so a prefetch can't mark anything seen).
export async function markNotificationsSeenAction(): Promise<void> {
  const userId = await getSessionUserId();
  if (!userId) return;
  await markNotificationsSeen(userId);
}
