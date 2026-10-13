"use server";

import { getSessionUserId } from "@/lib/current-user";
import { updateProfile } from "@/lib/writes/account";

// The rules live in lib/writes/account.ts, shared with the app's API.
export async function updateProfileAction(values: {
  displayName: string;
  bio?: string;
}): Promise<{ error: string } | { success: true }> {
  const userId = await getSessionUserId();
  if (!userId) return { error: "Log in to edit your profile." };

  const result = await updateProfile(userId, values);
  if (!result.ok) return { error: result.error };
  return { success: true };
}
