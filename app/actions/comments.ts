"use server";

import { createClient } from "@/lib/supabase/server";
import { addComment } from "@/lib/writes/comments";

// The rules (500 characters, 5 per 10 minutes and 50 a day) live in
// lib/writes/comments.ts, shared with the app's API.
export async function addCommentAction(
  paintingId: string,
  body: string
): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) return { error: "Log in to comment." };

  const result = await addComment(userId, paintingId, body);
  if (!result.ok) return { error: result.error };
  return { success: true };
}
