"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { hashedClientIp } from "@/lib/client-ip";
import { deletePaintingRecord } from "@/lib/delete-painting";
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

  // At most 5 attempts per IP per 15 minutes, so the password can't be
  // guessed by brute force. Every attempt counts, right or wrong.
  const { error: limitError } = await createAdminClient().rpc("claim_admin_login_attempt", {
    p_ip_hash: await hashedClientIp(),
  });
  if (limitError) {
    if (limitError.message.includes("rate_limited_admin")) {
      return { error: "Too many tries. Wait 15 minutes and try again." };
    }
    console.error("claim_admin_login_attempt failed", limitError);
    return { error: "Couldn't check that right now. Try again." };
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
    maxAge: 60 * 60 * 24 * 7,
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

  const result = await deletePaintingRecord(paintingId, null);
  if ("error" in result) return result;

  revalidatePath("/admin");
  return { success: true };
}
