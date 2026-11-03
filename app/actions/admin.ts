"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { hashedClientIp } from "@/lib/client-ip";
import { deletePaintingRecord } from "@/lib/delete-painting";
import { ADMIN_COOKIE, adminToken, isAdmin, safeEqual } from "@/lib/admin";
import { ADMIN_FLAG_COOKIE } from "@/lib/session-cookie";
import { revalidateAllFeeds } from "@/lib/revalidate";
import { challengeById, challengeColumns } from "@/lib/challenges";
import { getLatestComments, type AdminComment } from "@/lib/admin-comments";
import { SERVER_BUSY } from "@/lib/busy";

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

  const cookieOptions = {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  } as const;
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, token, { ...cookieOptions, httpOnly: true });
  // Readable by scripts and proves nothing: it only tells the browser to ask
  // the server whether this is an admin (components/viewer.tsx).
  cookieStore.set(ADMIN_FLAG_COOKIE, "1", cookieOptions);
  redirect("/admin");
}

export async function adminLogoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
  cookieStore.delete(ADMIN_FLAG_COOKIE);
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

/**
 * Puts a post in a challenge (an id from lib/challenges.ts) or takes it out
 * (null), and sets which day's prompt it's for (null = no day). Taking a
 * post out also clears the day.
 */
export async function adminSetChallengeAction(
  paintingId: string,
  challengeId: string | null,
  day: number | null = null
): Promise<{ error: string } | { success: true }> {
  if (!(await isAdmin())) return { error: "Not authorized." };
  const challenge = challengeById(challengeId);
  if (challengeId !== null && !challenge) return { error: "That challenge doesn't exist." };
  const days = challenge?.prompts.length ?? 31;
  if (day !== null && !(Number.isInteger(day) && day >= 1 && day <= days)) {
    return { error: `Pick a day from 1 to ${days}.` };
  }

  const { error } = await createAdminClient()
    .from("paintings")
    .update(challengeColumns(challenge?.id ?? null, day))
    .eq("id", paintingId);
  if (error) {
    console.error("adminSetChallengeAction failed", paintingId, error);
    return { error: "Couldn't save that. Try again." };
  }

  revalidatePath("/admin");
  // Whichever challenge it was in before needs rebuilding too.
  revalidateAllFeeds();
  revalidatePath(`/painting/${paintingId}`);
  // Its share picture shows the challenge day.
  revalidatePath(`/painting/${paintingId}/opengraph-image`);
  return { success: true };
}

export async function adminLatestCommentsAction(): Promise<
  { error: string } | { comments: AdminComment[] }
> {
  if (!(await isAdmin())) return { error: "Not authorized." };
  try {
    return { comments: await getLatestComments() };
  } catch (error) {
    console.error("adminLatestCommentsAction failed", error);
    return { error: SERVER_BUSY };
  }
}
