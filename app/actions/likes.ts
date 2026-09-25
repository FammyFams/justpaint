"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function toggleLikeAction(
  paintingId: string
): Promise<{ error: string } | { liked: boolean }> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  if (!userId) {
    return { error: "not-authenticated" };
  }

  const { data: existing } = await supabase
    .from("likes")
    .select("painting_id")
    .eq("painting_id", paintingId)
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("likes")
      .delete()
      .eq("painting_id", paintingId)
      .eq("user_id", userId);
    if (error) return { error: error.message };
    revalidatePath(`/painting/${paintingId}`);
    revalidatePath("/");
    return { liked: false };
  }

  const { error } = await supabase
    .from("likes")
    .insert({ painting_id: paintingId, user_id: userId });
  if (error) return { error: error.message };
  revalidatePath(`/painting/${paintingId}`);
  revalidatePath("/");
  return { liked: true };
}
