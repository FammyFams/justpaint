"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { ADMIN_COOKIE, adminToken, isAdmin, safeEqual } from "@/lib/admin";

export async function adminLoginAction(
  _prev: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const password = process.env.ADMIN_PASSWORD;
  const token = adminToken();
  if (!password || !token) {
    return { error: "ADMIN_PASSWORD isn't set on the server." };
  }

  const attempt = String(formData.get("password") ?? "");
  if (!safeEqual(attempt, password)) {
    return { error: "Wrong password." };
  }

  (await cookies()).set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  redirect("/admin");
}

export async function adminLogoutAction() {
  (await cookies()).delete(ADMIN_COOKIE);
  redirect("/admin");
}

export async function adminDeletePaintingAction(
  paintingId: string
): Promise<{ error: string } | { success: true }> {
  if (!(await isAdmin())) return { error: "Not authorized." };

  const admin = createAdminClient();
  const { data: painting, error: fetchError } = await admin
    .from("paintings")
    .select("image_path, owner_id")
    .eq("id", paintingId)
    .maybeSingle();

  if (fetchError) return { error: fetchError.message };
  if (!painting) return { error: "That painting no longer exists." };

  // Likes, comments and tag links cascade with the row.
  const { error: deleteError } = await admin
    .from("paintings")
    .delete()
    .eq("id", paintingId);
  if (deleteError) return { error: deleteError.message };

  // The post is already gone at this point; a leftover file is harmless.
  await admin.storage.from("paintings").remove([painting.image_path]);

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath(`/painting/${paintingId}`);
  if (painting.owner_id) revalidatePath(`/artist/${painting.owner_id}`);

  return { success: true };
}
