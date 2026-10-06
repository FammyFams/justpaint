"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site-url";
import { safeNext } from "@/lib/safe-next";
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
} from "@/lib/validations/auth";
import { authFailure, claimAuthAttempt, signUp } from "@/lib/writes/account";

// Sign-up's rules live in lib/writes/account.ts, shared with the app's API.
export async function signUpAction(values: {
  displayName: string;
  email: string;
  password: string;
  agreedToTerms: boolean;
}): Promise<{ error: string } | { success: true; needsConfirmation: boolean }> {
  const result = await signUp(await createClient(), values);
  if (!result.ok) return { error: result.error };

  if (result.session) {
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
  if (limited) return { error: limited.error };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: authFailure(error).error };
  }

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
  if (limited) return { error: limited.error };

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
    return { error: authFailure(error).error };
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
    return { error: authFailure(error).error };
  }

  return { success: true };
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
