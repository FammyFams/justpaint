// What a write in lib/writes returns when it can't go ahead. The website's
// server actions show `error`; the app API turns `code` into an HTTP status
// (lib/api/respond.ts) and sends both.
export type FailureCode =
  | "invalid" // bad input; error says what to fix
  | "unauthorized" // not signed in
  | "taken" // a display name someone else has
  | "exists" // an account with that email already
  | "closed" // sign-ups are switched off
  | "forbidden" // someone else's painting
  | "not_found" // the painting was deleted, or the id isn't a painting's
  | "rate_limited"
  | "busy"; // Supabase, Vercel or the email service failed or is over a limit

export interface WriteFailure {
  ok: false;
  code: FailureCode;
  error: string;
}

export function fail(code: FailureCode, error: string): WriteFailure {
  return { ok: false, code, error };
}
