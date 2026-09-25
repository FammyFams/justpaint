"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function deleteAccountAction(): Promise<{ error: string } | undefined> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  if (!userId) {
    return { error: "Not signed in." };
  }

  const admin = createAdminClient();

  // Painting/like/comment/profile rows cascade-delete via their foreign keys
  // once the auth user is gone, but the actual uploaded image files in
  // Storage don't -- clean those up first.
  const { data: files } = await admin.storage.from("paintings").list(userId);
  if (files && files.length > 0) {
    await admin.storage
      .from("paintings")
      .remove(files.map((file) => `${userId}/${file.name}`));
  }

  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) {
    return { error: error.message };
  }

  await supabase.auth.signOut();
  redirect("/");
}
