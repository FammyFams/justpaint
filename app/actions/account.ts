"use server";

import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/current-user";
import { createClient } from "@/lib/supabase/server";
import { deleteAccount } from "@/lib/writes/account";

// The deleting lives in lib/writes/account.ts, shared with the app's API.
export async function deleteAccountAction(): Promise<{ error: string } | undefined> {
  const userId = await getSessionUserId();
  if (!userId) {
    return { error: "Not signed in." };
  }

  const result = await deleteAccount(userId);
  if (!result.ok) return { error: result.error };

  await (await createClient()).auth.signOut();
  redirect("/");
}
