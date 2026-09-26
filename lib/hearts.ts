import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { visitorKey } from "@/lib/client-ip";

/**
 * Which of these paintings a signed-in user has hearted, so their hearts show
 * filled in on any device. Guests don't need this: their browser remembers
 * what it hearted.
 */
export async function getHeartedIds(userId: string, paintingIds: string[]): Promise<string[]> {
  if (paintingIds.length === 0) return [];
  const { data } = await createAdminClient()
    .from("painting_hearts")
    .select("painting_id")
    .eq("ip_hash", await visitorKey(userId))
    .in("painting_id", paintingIds);
  return (data ?? []).map((row) => row.painting_id);
}
