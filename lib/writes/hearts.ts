import "server-only";
import { revalidatePath } from "next/cache";
import { isUuid } from "@/lib/artist-url";
import { SERVER_BUSY } from "@/lib/busy";
import { visitorKey } from "@/lib/client-ip";
import { createAdminClient } from "@/lib/supabase/admin";
import { fail, type WriteFailure } from "@/lib/writes/result";

// Hearts, shared by the website's server action (app/actions/hearts.ts) and
// the app API (app/api/app/v1/hearts/*), so both follow the same rules.

const GONE = "That painting no longer exists.";

/**
 * One heart per painting per visitor: per account when signed in, per
 * (hashed) IP otherwise. Repeated calls can't inflate the count -- hearting
 * twice is a no-op, as is un-hearting something you never hearted. Returns
 * the updated total.
 */
export async function setHeart(
  userId: string | null,
  // Checked here; the app sends them straight from its request.
  paintingId: unknown,
  hearted: unknown
): Promise<WriteFailure | { ok: true; hearted: boolean; count: number }> {
  if (typeof paintingId !== "string" || !isUuid(paintingId)) return fail("not_found", GONE);
  if (typeof hearted !== "boolean") return fail("invalid", "Say whether to heart it or not.");

  const admin = createAdminClient();
  const ipHash = await visitorKey(userId);

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
  // 23503: the painting was deleted, so its heart has nothing to point at.
  if (error?.code === "23503") return fail("not_found", GONE);
  if (error) return fail("busy", SERVER_BUSY);

  const { data, error: countError } = await admin
    .from("paintings")
    .select("heart_count")
    .eq("id", paintingId)
    .maybeSingle();
  if (countError) return fail("busy", SERVER_BUSY);
  if (!data) return fail("not_found", GONE);

  revalidatePath(`/painting/${paintingId}`);

  return { ok: true, hearted, count: data.heart_count };
}
