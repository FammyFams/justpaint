"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { COMMENT_MAX_LENGTH } from "@/lib/validations/comment";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Comments go through the server like everything else: browser roles can't
// insert into the comments table directly (migration 20260926000002), and
// add_comment() limits each account to 5 comments per 10 minutes and 50 a day.
export async function addCommentAction(
  paintingId: string,
  body: string
): Promise<{ error: string } | { success: true }> {
  if (typeof paintingId !== "string" || !UUID.test(paintingId)) {
    return { error: "That painting no longer exists." };
  }
  const trimmed = typeof body === "string" ? body.trim() : "";
  if (!trimmed) return { error: "Comment can't be empty." };
  if (trimmed.length > COMMENT_MAX_LENGTH) {
    return { error: `Keep it under ${COMMENT_MAX_LENGTH} characters.` };
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) return { error: "Log in to comment." };

  const { error } = await createAdminClient().rpc("add_comment", {
    p_user_id: userId,
    p_painting_id: paintingId,
    p_body: trimmed,
  });

  if (error) {
    if (error.message.includes("rate_limited_comment")) {
      return { error: "You're commenting fast. Take a short break and try again." };
    }
    if (error.code === "23503") return { error: "That painting no longer exists." };
    console.error("add_comment failed", error);
    return { error: "Couldn't post that. Try again." };
  }

  revalidatePath(`/painting/${paintingId}`);
  return { success: true };
}
