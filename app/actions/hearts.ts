"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { visitorKey } from "@/lib/client-ip";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * One heart per painting per visitor: per account when signed in, per
 * (hashed) IP otherwise. Repeated calls can't inflate the count -- hearting
 * twice is a no-op, as is un-hearting something you never hearted. Returns
 * the updated total.
 */
export async function setHeartAction(
  paintingId: string,
  hearted: boolean
): Promise<{ error: string } | { count: number }> {
  if (!UUID.test(paintingId)) return { error: "Unknown painting." };

  const admin = createAdminClient();
  const { data: claims } = await (await createClient()).auth.getClaims();
  const ipHash = await visitorKey(claims?.claims?.sub ?? null);

  const { error } = hearted
    ? await admin
        .from("painting_hearts")
        .upsert(
          { painting_id: paintingId, ip_hash: ipHash },
          { onConflict: "painting_id,ip_hash", ignoreDuplicates: true }
        )
    : await admin
        .from("painting_hearts")
        .delete()
        .eq("painting_id", paintingId)
        .eq("ip_hash", ipHash);
  if (error) return { error: "Couldn't save that. Try again." };

  const { data } = await admin
    .from("paintings")
    .select("heart_count")
    .eq("id", paintingId)
    .maybeSingle();
  if (!data) return { error: "That painting no longer exists." };

  revalidatePath("/");
  revalidatePath(`/painting/${paintingId}`);

  return { count: data.heart_count };
}
