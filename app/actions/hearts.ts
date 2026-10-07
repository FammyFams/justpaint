"use server";

import { createClient } from "@/lib/supabase/server";
import { setHeart } from "@/lib/writes/hearts";

// The rules live in lib/writes/hearts.ts, shared with the app's API. Guests
// count per IP here; the app always sends an account.
export async function setHeartAction(
  paintingId: string,
  hearted: boolean
): Promise<{ error: string } | { count: number }> {
  const { data: claims } = await (await createClient()).auth.getClaims();
  const result = await setHeart(claims?.claims?.sub ?? null, paintingId, hearted);
  if (!result.ok) return { error: result.error };
  return { count: result.count };
}
