"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { deleteAccount } from "@/lib/writes/account";

// The deleting lives in lib/writes/account.ts, shared with the app's API.
export async function deleteAccountAction(): Promise<{ error: string } | undefined> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  if (!userId) {
    return { error: "Not signed in." };
  }

  const result = await deleteAccount(userId);
  if (!result.ok) return { error: result.error };

  await supabase.auth.signOut();
  redirect("/");
}
