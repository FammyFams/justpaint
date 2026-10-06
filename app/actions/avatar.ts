"use server";

import { getSessionUserId } from "@/lib/current-user";
import { removeAvatar, setAvatar } from "@/lib/writes/avatar";

// The rules live in lib/writes/avatar.ts, shared with the app's API.

export async function setAvatarAction(
  image: File
): Promise<{ error: string } | { success: true; avatarUrl: string }> {
  const userId = await getSessionUserId();
  if (!userId) return { error: "Log in to change your profile picture." };

  const result = await setAvatar(userId, image);
  if (!result.ok) return { error: result.error };
  return { success: true, avatarUrl: result.avatarUrl };
}

export async function removeAvatarAction(): Promise<{ error: string } | { success: true }> {
  const userId = await getSessionUserId();
  if (!userId) return { error: "Log in to change your profile picture." };

  const result = await removeAvatar(userId);
  if (!result.ok) return { error: result.error };
  return { success: true };
}
