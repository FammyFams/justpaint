import "server-only";
import { revalidatePath } from "next/cache";
import { isUuid } from "@/lib/artist-url";
import { SERVER_BUSY } from "@/lib/busy";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasBlockedWord } from "@/lib/text-filter";
import { COMMENT_MAX_LENGTH } from "@/lib/validations/comment";
import { fail, type WriteFailure } from "@/lib/writes/result";

// Comments, shared by the website's server action (app/actions/comments.ts)
// and the app API (app/api/app/v1/comments), so both follow the same rules.

const GONE = "That painting no longer exists.";

/**
 * Comments go through the server like everything else: browser roles can't
 * insert into the comments table directly (migration 20260926000002), and
 * add_comment() limits each account to 5 comments per 10 minutes and 50 a
 * day. Returns the new comment's id and its saved (trimmed) text.
 */
export async function addComment(
  userId: string,
  // Checked here; the app sends them straight from its request.
  paintingId: unknown,
  body: unknown
): Promise<WriteFailure | { ok: true; comment: { id: string; body: string } }> {
  if (typeof paintingId !== "string" || !isUuid(paintingId)) return fail("not_found", GONE);
  const trimmed = typeof body === "string" ? body.trim() : "";
  if (!trimmed) return fail("invalid", "Comment can't be empty.");
  if (trimmed.length > COMMENT_MAX_LENGTH) {
    return fail("invalid", `Keep it under ${COMMENT_MAX_LENGTH} characters.`);
  }
  if (hasBlockedWord(trimmed)) {
    return fail("invalid", "Your comment has a word we don't allow. Please reword it.");
  }

  const { data: id, error } = await createAdminClient().rpc("add_comment", {
    p_user_id: userId,
    p_painting_id: paintingId,
    p_body: trimmed,
  });

  if (error) {
    if (error.message.includes("rate_limited_comment")) {
      return fail("rate_limited", "You're commenting fast. Take a short break and try again.");
    }
    // 23503: the painting was deleted, or (with an app token still valid for
    // up to an hour) the account was.
    if (error.code === "23503") {
      return error.message.includes("user_id")
        ? fail("unauthorized", "Log in to comment.")
        : fail("not_found", GONE);
    }
    console.error("add_comment failed", error);
    return fail("busy", SERVER_BUSY);
  }

  revalidatePath(`/painting/${paintingId}`);
  return { ok: true, comment: { id, body: trimmed } };
}
