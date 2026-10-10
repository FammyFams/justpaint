import "server-only";
import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SERVER_BUSY } from "@/lib/busy";
import { hashedClientIp, hashedEmail } from "@/lib/client-ip";
import { allImagePaths } from "@/lib/painting-sizes";
import { revalidateFeeds, revalidatePaintingsShowing, revalidateProfile } from "@/lib/revalidate";
import { getSiteUrl } from "@/lib/site-url";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/database.types";
import { hasBlockedWord, NAME_BLOCKED } from "@/lib/text-filter";
import { signupSchema } from "@/lib/validations/auth";
import { profileSchema } from "@/lib/validations/profile";
import { removeAvatarFiles } from "@/lib/writes/avatar";
import { fail, type WriteFailure } from "@/lib/writes/result";

// Account writes shared by the website's server actions (app/actions/auth.ts,
// profile.ts, account.ts) and the app API (app/api/app/v1/*), so both follow
// the same rules.

const TOO_MANY_TRIES = "Too many tries. Wait a bit and try again.";
const NAME_TAKEN = "That display name is taken. Try another.";

// Supabase's own auth limits see the server's IP, not the visitor's, so count
// tries here: sign-in 10 per 15 minutes per IP and per email, sign-up 5 per
// hour per IP, password reset 3 per hour per IP and per email
// (claim_auth_attempt). Returns a failure, or null to go on.
export async function claimAuthAttempt(
  kind: "sign_in" | "sign_up" | "password_reset",
  email?: string
): Promise<WriteFailure | null> {
  const { error } = await createAdminClient().rpc("claim_auth_attempt", {
    p_kind: kind,
    p_ip_hash: await hashedClientIp(),
    p_email_hash: email ? hashedEmail(email) : undefined,
  });
  if (!error) return null;
  if (error.message.includes("rate_limited_auth")) return fail("rate_limited", TOO_MANY_TRIES);
  // PGRST202: the function isn't in the database yet (migration
  // 20260930000001 not applied). Let people in rather than lock everyone out.
  if (error.code === "PGRST202") {
    console.error("claim_auth_attempt missing: apply migration 20260930000001");
    return null;
  }
  // 23514: the table doesn't allow password_reset yet (migration
  // 20261003000001 not applied). Supabase's own email limits still apply.
  if (error.code === "23514") {
    console.error("password_reset limit missing: apply migration 20261003000001");
    return null;
  }
  console.error("claim_auth_attempt failed", error);
  return fail("busy", SERVER_BUSY);
}

// Supabase's own messages are written for developers; show people these.
export function authFailure({ message, code }: { message: string; code?: string }): WriteFailure {
  const m = message.toLowerCase();
  // Supabase sends at most 30 auth emails an hour (Auth > Rate Limits).
  if (code === "over_email_send_rate_limit") {
    return fail(
      "busy",
      "Lots of people are signing up, so the server is busy and can't send your confirmation email yet. Try again in an hour."
    );
  }
  // The email service (Resend, 100 a day on the free plan) refused to send.
  if (m.includes("error sending")) {
    return fail("busy", "The server is busy and couldn't send your confirmation email. Try again later.");
  }
  if (m.includes("signups not allowed")) return fail("closed", "Sign-ups are closed right now.");
  if (m.includes("already registered")) {
    return fail("exists", "There's already an account with that email. Log in instead.");
  }
  if (m.includes("invalid login credentials")) return fail("invalid", "Wrong email or password.");
  if (m.includes("email not confirmed")) {
    return fail("invalid", "Confirm your email first. Check your inbox for the link.");
  }
  if (m.includes("rate limit")) return fail("rate_limited", TOO_MANY_TRIES);
  // Password rules (too short, too weak) are worth showing as-is.
  if (m.includes("password")) return fail("invalid", message);
  console.error("auth error", code, message);
  return fail("busy", SERVER_BUSY);
}

function firstIssue(error: { issues: { message: string }[] }): WriteFailure {
  return fail("invalid", error.issues[0]?.message ?? "Invalid input");
}

/**
 * Creates an account: name rules, 13+ and Terms, sign-up limits, unique name.
 * `supabase` is the client the new session lands in: the website's cookie
 * client, or a cookie-free one for the app. With email confirmation on (the
 * normal case) there's no session until the link in the email is opened.
 */
export async function signUp(
  supabase: SupabaseClient<Database>,
  // Checked here; the website form and the app send { displayName, email,
  // password, agreedToTerms }.
  values: unknown
): Promise<
  | WriteFailure
  | { ok: true; session: { access_token: string; refresh_token: string } | null }
> {
  const parsed = signupSchema.safeParse(values);
  if (!parsed.success) return firstIssue(parsed.error);
  if (hasBlockedWord(parsed.data.displayName)) return fail("invalid", NAME_BLOCKED);

  const limited = await claimAuthAttempt("sign_up");
  if (limited) return limited;

  const { data: taken } = await createAdminClient().rpc("display_name_taken", {
    p_name: parsed.data.displayName,
  });
  if (taken) return fail("taken", NAME_TAKEN);

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { display_name: parsed.data.displayName },
      emailRedirectTo: `${getSiteUrl()}/auth/confirm`,
    },
  });
  if (error) return authFailure(error);

  const session = data.session
    ? { access_token: data.session.access_token, refresh_token: data.session.refresh_token }
    : null;
  return { ok: true, session };
}

/**
 * Browser roles can't update profiles directly (migration 20260926000002), so
 * only this can, and only the signed-in user's own row, and only the name and
 * bio.
 */
export async function updateProfile(
  userId: string,
  // Checked here: { displayName, bio? }.
  values: unknown
): Promise<WriteFailure | { ok: true; profile: { displayName: string; bio: string } }> {
  const parsed = profileSchema.safeParse(values);
  if (!parsed.success) return firstIssue(parsed.error);
  if (hasBlockedWord(parsed.data.displayName)) return fail("invalid", NAME_BLOCKED);
  if (hasBlockedWord(parsed.data.bio ?? "")) {
    return fail("invalid", "Your bio has a word we don't allow. Please reword it.");
  }

  const admin = createAdminClient();
  const { data: taken } = await admin.rpc("display_name_taken", {
    p_name: parsed.data.displayName,
    p_exclude: userId,
  });
  if (taken) return fail("taken", NAME_TAKEN);

  const { data: before } = await admin
    .from("profiles")
    .select("display_name")
    .eq("id", userId)
    .maybeSingle();

  const bio = parsed.data.bio ?? "";
  const { error } = await admin
    .from("profiles")
    .update({
      display_name: parsed.data.displayName,
      bio,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  // 23505: someone claimed the name between the check and the save.
  if (error?.code === "23505") return fail("taken", NAME_TAKEN);
  if (error) {
    console.error("profile update failed", error);
    return fail("busy", SERVER_BUSY);
  }

  // The bio only shows on the profile. A new name also shows on the feeds,
  // their posts and the posts they commented on, and the profile moves to a
  // new address. Never the whole site: people save their profile many times
  // a day, and each full rebuild cost Active CPU (lib/revalidate.ts).
  revalidateProfile(userId, parsed.data.displayName);
  if (before?.display_name !== parsed.data.displayName) {
    if (before?.display_name) revalidateProfile(userId, before.display_name);
    revalidateFeeds();
    await revalidatePaintingsShowing(userId);
  }
  return { ok: true, profile: { displayName: parsed.data.displayName, bio } };
}

/**
 * Deletes the account and everything in it. Deleting the auth user also ends
 * its sessions (refresh tokens); an access token already handed out keeps
 * verifying until it expires (an hour at most), but its user is gone.
 */
export async function deleteAccount(userId: string): Promise<WriteFailure | { ok: true }> {
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
    .filter((path) => path.startsWith(`${userId}/`))
    .flatMap(allImagePaths);
  for (let i = 0; i < paths.length; i += 100) {
    await admin.storage.from("paintings").remove(paths.slice(i, i + 100));
  }
  await removeAvatarFiles(userId);

  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) {
    console.error("account delete failed", error);
    return fail("busy", SERVER_BUSY);
  }

  // Their posts and comments were on cached pages all over the site.
  revalidatePath("/", "layout");
  return { ok: true };
}
