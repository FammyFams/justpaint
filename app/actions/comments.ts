"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addCommentAction(
  paintingId: string,
  body: string
): Promise<{ error: string } | { success: true }> {
  const trimmed = body.trim();
  if (!trimmed) return { error: "Comment can't be empty." };
  if (trimmed.length > 2000) return { error: "Keep it under 2000 characters." };

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  if (!userId) return { error: "not-authenticated" };

  const { error } = await supabase
    .from("comments")
    .insert({ painting_id: paintingId, user_id: userId, body: trimmed });

  if (error) return { error: error.message };

  revalidatePath(`/painting/${paintingId}`);
  return { success: true };
}
