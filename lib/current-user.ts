import { cookies } from "next/headers";
import {
  isAuthApiError,
  isAuthRefreshDiscardedError,
  isAuthRetryableFetchError,
  type AuthError,
  type JwtPayload,
} from "@supabase/supabase-js";
import { avatarUrlOrNull } from "@/lib/avatar-url";
import { AUTH_COOKIE } from "@/lib/session-cookie";
import { createClient } from "@/lib/supabase/server";

export interface CurrentUser {
  id: string;
  email: string | undefined;
  displayName: string;
  avatarUrl: string | null;
}

/** Shown when a signed-in action finds the login has ended (components/viewer.tsx says the same). */
export const LOGGED_OUT = "You were logged out. Log in again to keep going.";

// Supabase down or unreachable, or a refresh that lost a race with a login
// or logout. None of these mean the login itself is over.
function isOutage(error: AuthError | null): boolean {
  return (
    isAuthRetryableFetchError(error) ||
    isAuthRefreshDiscardedError(error) ||
    (isAuthApiError(error) && error.status >= 500)
  );
}

/**
 * Reads the login cookie. `ended` means the browser sent one but its login
 * is over: Supabase turned down the refresh, the account is gone, or the
 * cookie can't be read. Then its cookies are deleted, so the browser stops
 * acting signed in, and components/viewer.tsx tells the person they were
 * logged out. An outage only reads as "nobody" for this request.
 */
async function readSession() {
  const store = await cookies();
  const loginCookies = store
    .getAll()
    .filter((c) => c.name === AUTH_COOKIE || c.name.startsWith(`${AUTH_COOKIE}.`));
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (data?.claims) return { supabase, claims: data.claims as JwtPayload, ended: false };

  const ended = loginCookies.length > 0 && !isOutage(error);
  if (ended) {
    try {
      for (const c of loginCookies) store.delete(c.name);
    } catch {
      // Server Components can't change cookies; proxy.ts runs before those pages.
    }
  }
  return { supabase, claims: null, ended };
}

export async function getCurrentSession(): Promise<{ user: CurrentUser | null; ended: boolean }> {
  const { supabase, claims, ended } = await readSession();
  if (!claims) return { user: null, ended };

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, avatar_url")
    .eq("id", claims.sub)
    .single();

  return {
    user: {
      id: claims.sub,
      email: claims.email,
      displayName: profile?.display_name || claims.email?.split("@")[0] || "You",
      avatarUrl: avatarUrlOrNull(profile?.avatar_url),
    },
    ended: false,
  };
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  return (await getCurrentSession()).user;
}

/** Just the signed-in user's id, without the profile lookup. */
export async function getSessionState(): Promise<{ userId: string | null; ended: boolean }> {
  const { claims, ended } = await readSession();
  return { userId: claims?.sub ?? null, ended };
}

export async function getSessionUserId(): Promise<string | null> {
  return (await getSessionState()).userId;
}
