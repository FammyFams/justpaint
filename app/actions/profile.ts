"use server";

import { createClient } from "@/lib/supabase/server";
import { updateProfile } from "@/lib/writes/account";

// The rules live in lib/writes/account.ts, shared with the app's API.
export async function updateProfileAction(values: {
  displayName: string;
  bio?: string;
}): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) return { error: "Log in to edit your profile." };

  const result = await updateProfile(userId, values);
  if (!result.ok) return { error: result.error };
  return { success: true };
}
