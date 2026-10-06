import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { visitorKey } from "@/lib/client-ip";

/**
 * Every painting a signed-in user has hearted (the newest 1,000, Supabase's
 * most rows per request), so their hearts show filled in on any page and
 * any device. Guests don't need this: their browser remembers what it
 * hearted.
 */
export async function getAllHeartedIds(userId: string): Promise<string[]> {
  const { data } = await createAdminClient()
    .from("painting_hearts")
    .select("painting_id")
    .eq("ip_hash", await visitorKey(userId))
    .order("created_at", { ascending: false })
    .limit(1000);
  return (data ?? []).map((row) => row.painting_id);
}
