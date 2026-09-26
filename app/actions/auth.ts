"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSiteUrl } from "@/lib/site-url";
import { safeNext } from "@/lib/safe-next";
import { loginSchema, signupSchema } from "@/lib/validations/auth";

// Supabase's own messages are written for developers; show people these.
function friendlyAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("signups not allowed")) return "Sign-ups are closed right now.";
  if (m.includes("already registered")) {
    return "There's already an account with that email. Log in instead.";
  }
  if (m.includes("invalid login credentials")) return "Wrong email or password.";
  if (m.includes("email not confirmed")) {
    return "Confirm your email first. Check your inbox for the link.";
  }
  if (m.includes("rate limit")) return "Too many tries. Wait a bit and try again.";
  // Password rules (too short, too weak) are worth showing as-is.
  if (m.includes("password")) return message;
  console.error("auth error", message);
  return "Something went wrong. Try again.";
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
    return { error: friendlyAuthError(error.message) };
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

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: friendlyAuthError(error.message) };
  }

  revalidatePath("/", "layout");
  redirect(safeNext(next));
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
