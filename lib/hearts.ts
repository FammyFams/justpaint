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
  return (await getHeartedIds(userId)) ?? [];
}

/**
 * The app's version (GET /api/app/v1/hearts): every painting hearted (the
 * newest 1,000), or just which of `among` were. Null when Supabase fails, so
 * the app can tell "none" from "couldn't check".
 */
export async function getHeartedIds(userId: string, among?: string[]): Promise<string[] | null> {
  let query = createAdminClient()
    .from("painting_hearts")
    .select("painting_id")
    .eq("ip_hash", await visitorKey(userId));
  if (among) query = query.in("painting_id", among);
  const { data, error } = await query.order("created_at", { ascending: false }).limit(1000);
  if (error) return null;
  return data.map((row) => row.painting_id);
}
