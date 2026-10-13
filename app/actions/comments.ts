"use server";

import { getSessionUserId } from "@/lib/current-user";
import { addComment } from "@/lib/writes/comments";

// The rules (500 characters, 5 per 10 minutes and 50 a day) live in
// lib/writes/comments.ts, shared with the app's API.
export async function addCommentAction(
  paintingId: string,
  body: string
): Promise<{ error: string } | { success: true }> {
  const userId = await getSessionUserId();
  if (!userId) return { error: "Log in to comment." };

  const result = await addComment(userId, paintingId, body);
  if (!result.ok) return { error: result.error };
  return { success: true };
}
