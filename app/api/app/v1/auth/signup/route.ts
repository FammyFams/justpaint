import { failed, json, readJson } from "@/lib/api/respond";
import { createPublicClient } from "@/lib/supabase/public";
import { signUp } from "@/lib/writes/account";

// Creates an account from the app: same rules as the website's sign-up form
// (name rules, 13+ and Terms, sign-up limits). Body:
// { displayName, email, password, agreedToTerms }. Supabase emails a
// confirmation link that opens the website; the app signs in after that.
export async function POST(request: Request) {
  // Cookie-free: a session (only when email confirmation is off) goes back to
  // the app in the answer, not into cookies.
  const result = await signUp(createPublicClient(), await readJson(request));
  if (!result.ok) return failed(result);
  return json({ needsConfirmation: !result.session, session: result.session }, { status: 201 });
}
