"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { profileSchema } from "@/lib/validations/profile";

// Browser roles can't update profiles directly (migration 20260926000002), so
// only this action can, and only the signed-in user's own row, and only the
// name and bio.
export async function updateProfileAction(values: {
  displayName: string;
  bio?: string;
}): Promise<{ error: string } | { success: true }> {
  const parsed = profileSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) return { error: "Log in to edit your profile." };

  const admin = createAdminClient();
  const { data: taken } = await admin.rpc("display_name_taken", {
    p_name: parsed.data.displayName,
    p_exclude: userId,
  });
  if (taken) return { error: "That display name is taken. Try another." };

  const { error } = await admin
    .from("profiles")
    .update({
      display_name: parsed.data.displayName,
      bio: parsed.data.bio ?? "",
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  // 23505: someone claimed the name between the check and the save.
  if (error?.code === "23505") return { error: "That display name is taken. Try another." };
  if (error) {
    console.error("profile update failed", error);
    return { error: "Couldn't save your profile. Try again." };
  }

  revalidatePath(`/artist/${userId}`);
  revalidatePath(`/artist/${userId}/edit`);
  return { success: true };
}
