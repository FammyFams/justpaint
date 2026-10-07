import "server-only";
import { isUuid } from "@/lib/artist-url";
import { SERVER_BUSY } from "@/lib/busy";
import { createAdminClient } from "@/lib/supabase/admin";
import { fail, type WriteFailure } from "@/lib/writes/result";

// Blocks, for the app's API (app/api/app/v1/blocks). The website has no block
// button; the app hides a blocked artist's paintings and comments from the
// person who blocked them. Private: the blocked person is never told.

// Far more than anyone should need; keeps one account from filling the table.
const BLOCKS_MAX = 1000;

const NO_ONE = "That account doesn't exist anymore.";

export interface BlockedArtist {
  id: string;
  displayName: string;
  blockedAt: string;
}

/** Everyone this person has blocked, newest first, with their current names. */
export async function listBlocks(
  userId: string
): Promise<WriteFailure | { ok: true; blocked: BlockedArtist[] }> {
  const { data, error } = await createAdminClient()
    .from("user_blocks")
    .select("blocked_id, created_at, profiles!user_blocks_blocked_id_fkey(display_name)")
    .eq("blocker_id", userId)
    .order("created_at", { ascending: false })
    .limit(BLOCKS_MAX);
  if (error) {
    console.error("list blocks failed", error);
    return fail("busy", SERVER_BUSY);
  }
  return {
    ok: true,
    blocked: data.map((row) => ({
      id: row.blocked_id,
      displayName: row.profiles?.display_name || "unnamed artist",
      blockedAt: row.created_at,
    })),
  };
}

/** Blocks an account. Blocking someone already blocked is fine (nothing changes). */
export async function blockUser(
  userId: string,
  // Checked here; the app sends it straight from its request.
  blockedId: unknown
): Promise<WriteFailure | { ok: true; blocked: { id: string; displayName: string } }> {
  if (typeof blockedId !== "string" || !isUuid(blockedId)) return fail("not_found", NO_ONE);
  const id = blockedId.toLowerCase();
  if (id === userId) return fail("invalid", "You can't block yourself.");

  const admin = createAdminClient();
  const { data: profile, error: lookupError } = await admin
    .from("profiles")
    .select("display_name")
    .eq("id", id)
    .maybeSingle();
  if (lookupError) {
    console.error("block lookup failed", lookupError);
    return fail("busy", SERVER_BUSY);
  }
  if (!profile) return fail("not_found", NO_ONE);

  const { count } = await admin
    .from("user_blocks")
    .select("blocked_id", { count: "exact", head: true })
    .eq("blocker_id", userId);
  if ((count ?? 0) >= BLOCKS_MAX) {
    return fail("rate_limited", `You've blocked ${BLOCKS_MAX} accounts, the most there can be.`);
  }

  const { error } = await admin
    .from("user_blocks")
    .upsert({ blocker_id: userId, blocked_id: id }, { onConflict: "blocker_id,blocked_id", ignoreDuplicates: true });
  if (error) {
    // 23503: the blocker's own account was deleted while an app token was
    // still valid (it can last an hour).
    if (error.code === "23503") return fail("unauthorized", "Log in to block someone.");
    console.error("block failed", error);
    return fail("busy", SERVER_BUSY);
  }
  return { ok: true, blocked: { id, displayName: profile.display_name || "unnamed artist" } };
}

/** Unblocks an account. Unblocking someone who isn't blocked is fine too. */
export async function unblockUser(
  userId: string,
  blockedId: unknown
): Promise<WriteFailure | { ok: true }> {
  if (typeof blockedId !== "string" || !isUuid(blockedId)) return fail("not_found", NO_ONE);

  const { error } = await createAdminClient()
    .from("user_blocks")
    .delete()
    .eq("blocker_id", userId)
    .eq("blocked_id", blockedId.toLowerCase());
  if (error) {
    console.error("unblock failed", error);
    return fail("busy", SERVER_BUSY);
  }
  return { ok: true };
}
