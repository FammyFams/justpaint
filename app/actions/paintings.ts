"use server";

import { createClient } from "@/lib/supabase/server";
import {
  createPainting,
  deleteOwnPainting,
  type CreatePaintingInput,
} from "@/lib/writes/paintings";

// The rules (4 MB, re-encoding, 5 posts per 16 hours) live in
// lib/writes/paintings.ts, shared with the app's API.

async function sessionUserId(): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  return data?.claims?.sub ?? null;
}

// Signed-in uploads belong to the user's profile; everyone else posts as a
// guest with a name. The owner comes from the verified session.
export async function createPaintingAction(
  input: CreatePaintingInput
): Promise<{ error: string } | { success: true; paintingId: string }> {
  const result = await createPainting(await sessionUserId(), input);
  if (!result.ok) return { error: result.error };
  return { success: true, paintingId: result.paintingId };
}

/** Lets a signed-in user delete one of their own posts. */
export async function deleteOwnPaintingAction(
  paintingId: string
): Promise<{ error: string } | { success: true }> {
  const userId = await sessionUserId();
  if (!userId) return { error: "Log in to delete your paintings." };

  const result = await deleteOwnPainting(userId, paintingId);
  if (!result.ok) return { error: result.error };
  return { success: true };
}
