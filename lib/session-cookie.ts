// Pages are cached and the same for everyone, so the browser works out on
// its own whether to ask the server who's signed in. Both cookies are
// readable by scripts: Supabase's login cookie is by design (@supabase/ssr),
// and ADMIN_FLAG_COOKIE only says "an admin cookie exists" (the real one,
// lib/admin.ts, stays httpOnly).

/** Supabase's login cookie, split into .0, .1... when the session is long. */
export const AUTH_COOKIE = `sb-${new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname.split(".")[0]}-auth-token`;

export const ADMIN_FLAG_COOKIE = "jp_admin_flag";

/** Matches a cookie string holding either cookie. Plain characters only, so no escaping. */
export const SESSION_COOKIE_PATTERN = `(?:^|; )(?:${AUTH_COOKIE}(?:\\.\\d+)?|${ADMIN_FLAG_COOKIE})=`;

export function hasSessionCookie(cookies: string): boolean {
  return new RegExp(SESSION_COOKIE_PATTERN).test(cookies);
}
