import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeNext } from "@/lib/safe-next";

// Handles the link in the "confirm your email" message. The email template
// sends ?token_hash=...&type=email, which works from any browser. Supabase's
// default template sends ?code=... instead; that can only sign you in from
// the browser you signed up in, but the email is already confirmed by the
// time you land here, so a failed exchange just goes to the login page.
//
// Password reset links come here too (type=recovery, next=/reset-password).
// One that expired or was already used goes back to the form to send a new one.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));
  const isReset = type === "recovery" || next.startsWith("/reset-password");

  const supabase = await createClient();

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) redirect(next);
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) redirect(next);
    if (!isReset) redirect("/login?confirmed=1");
  }

  redirect(isReset ? "/forgot-password?expired=1" : "/auth/auth-code-error");
}
