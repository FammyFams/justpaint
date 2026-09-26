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

  // Painting/comment/profile rows cascade-delete via their foreign keys once
  // the auth user is gone, but the uploaded image files in Storage don't.
  // Remove them by the paths recorded on the user's posts (a folder listing
  // would stop at 100 files).
  const { data: paintings } = await admin
    .from("paintings")
    .select("image_path")
    .eq("owner_id", userId);
  const paths = (paintings ?? [])
    .map((p) => p.image_path)
    .filter((path) => path.startsWith(`${userId}/`));
  for (let i = 0; i < paths.length; i += 100) {
    await admin.storage.from("paintings").remove(paths.slice(i, i + 100));
  }

  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) {
    console.error("account delete failed", error);
    return { error: "Couldn't delete your account. Try again." };
  }

  await supabase.auth.signOut();
  redirect("/");
}
