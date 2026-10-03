"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSiteUrl } from "@/lib/site-url";
import { safeNext } from "@/lib/safe-next";
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signupSchema,
} from "@/lib/validations/auth";
import { SERVER_BUSY } from "@/lib/busy";
import { hashedClientIp, hashedEmail } from "@/lib/client-ip";

const TOO_MANY_TRIES = "Too many tries. Wait a bit and try again.";

// Supabase's own auth limits see the server's IP, not the visitor's, so count
// tries here: sign-in 10 per 15 minutes per IP and per email, sign-up 5 per
// hour per IP, password reset 3 per hour per IP and per email
// (claim_auth_attempt). Returns an error message, or null to go on.
async function claimAuthAttempt(
  kind: "sign_in" | "sign_up" | "password_reset",
  email?: string
): Promise<string | null> {
  const { error } = await createAdminClient().rpc("claim_auth_attempt", {
    p_kind: kind,
    p_ip_hash: await hashedClientIp(),
    p_email_hash: email ? hashedEmail(email) : undefined,
  });
  if (!error) return null;
  if (error.message.includes("rate_limited_auth")) return TOO_MANY_TRIES;
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
  return SERVER_BUSY;
}

// Supabase's own messages are written for developers; show people these.
function friendlyAuthError({ message, code }: { message: string; code?: string }): string {
  const m = message.toLowerCase();
  // Supabase sends at most 30 auth emails an hour (Auth > Rate Limits).
  if (code === "over_email_send_rate_limit") {
    return "Lots of people are signing up, so the server is busy and can't send your confirmation email yet. Try again in an hour.";
  }
  // The email service (Resend, 100 a day on the free plan) refused to send.
  if (m.includes("error sending")) {
    return "The server is busy and couldn't send your confirmation email. Try again later.";
  }
  if (m.includes("signups not allowed")) return "Sign-ups are closed right now.";
  if (m.includes("already registered")) {
    return "There's already an account with that email. Log in instead.";
  }
  if (m.includes("invalid login credentials")) return "Wrong email or password.";
  if (m.includes("email not confirmed")) {
    return "Confirm your email first. Check your inbox for the link.";
  }
  if (m.includes("rate limit")) return TOO_MANY_TRIES;
  // Password rules (too short, too weak) are worth showing as-is.
  if (m.includes("password")) return message;
  console.error("auth error", code, message);
  return SERVER_BUSY;
}

export async function signUpAction(values: {
  displayName: string;
  email: string;
  password: string;
  agreedToTerms: boolean;
}): Promise<{ error: string } | { success: true; needsConfirmation: boolean }> {
  const parsed = signupSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const limited = await claimAuthAttempt("sign_up");
  if (limited) return { error: limited };

  const supabase = await createClient();
  const { data: taken } = await createAdminClient().rpc("display_name_taken", {
    p_name: parsed.data.displayName,
  });
  if (taken) return { error: "That display name is taken. Try another." };

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { display_name: parsed.data.displayName },
      emailRedirectTo: `${getSiteUrl()}/auth/confirm`,
    },
  });

  if (error) {
    return { error: friendlyAuthError(error) };
  }

  if (data.session) {
    revalidatePath("/", "layout");
    redirect("/");
  }

  return { success: true, needsConfirmation: true };
}

export async function signInAction(
  values: { email: string; password: string },
  next?: string
): Promise<{ error: string } | undefined> {
  const parsed = loginSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const limited = await claimAuthAttempt("sign_in", parsed.data.email);
  if (limited) return { error: limited };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: friendlyAuthError(error) };
  }

  revalidatePath("/", "layout");
  redirect(safeNext(next));
}

// Answers the same way whether or not the email has an account (Supabase
// doesn't say either), so the form can't be used to look up who's signed up.
export async function requestPasswordResetAction(values: {
  email: string;
}): Promise<{ error: string } | { success: true }> {
  const parsed = forgotPasswordSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const limited = await claimAuthAttempt("password_reset", parsed.data.email);
  if (limited) return { error: limited };

  const supabase = await createClient();
  // The Reset Password email template links to /auth/confirm with a token,
  // which works from any browser. redirectTo is only used if the template is
  // Supabase's default, which works only in the browser that asked.
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${getSiteUrl()}/auth/confirm?next=/reset-password`,
  });

  if (error) {
    // Supabase waits 60 seconds between emails to one address and sends at
    // most 30 auth emails an hour in all.
    if (error.status === 429 || error.code === "over_email_send_rate_limit") {
      return { error: "The server can't send another email yet. Wait a few minutes and try again." };
    }
    if (error.message.toLowerCase().includes("error sending")) {
      return { error: "The server is busy and couldn't send the email. Try again later." };
    }
    return { error: friendlyAuthError(error) };
  }

  return { success: true };
}

// The reset link signs the person in (see /auth/confirm); this sets the new
// password on that session.
export async function updatePasswordAction(values: {
  password: string;
  confirmPassword: string;
}): Promise<{ error: string } | { success: true }> {
  const parsed = resetPasswordSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) {
    return { error: "Your reset link expired. Go back and send yourself a new one." };
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    return { error: friendlyAuthError(error) };
  }

  return { success: true };
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
