"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionUserId } from "@/lib/current-user";

// Called from /notifications once the page is on screen (not while it
// renders, so a prefetch can't mark anything seen).
export async function markNotificationsSeenAction(): Promise<void> {
  const userId = await getSessionUserId();
  if (!userId) return;

  const { error } = await createAdminClient()
    .from("notification_reads")
    .upsert({ user_id: userId, seen_at: new Date().toISOString() });
  if (error) console.error("markNotificationsSeenAction failed", error);
}
