import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/database.types";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          // Put the refreshed tokens on the request too, so this same page
          // render sees the new session instead of the expired one.
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
          Object.entries(headers).forEach(([key, value]) =>
            supabaseResponse.headers.set(key, value)
          );
        },
      },
    }
  );

  // Refreshes the session token if needed — must run before any response is built.
  await supabase.auth.getClaims();

  return supabaseResponse;
}

// Only where a Server Component reads the session: those can't save a
// refreshed token themselves (lib/supabase/server.ts), so it's refreshed
// here first. That's /notifications, /artist/<name>/edit and
// /reset-password (getCurrentUser). Server actions and route handlers save
// their own refreshed tokens, and every other page is cached and the same
// for everyone, so a run there does nothing. Each run is billed Active CPU;
// running on every signed-in request was about 4,500 runs a day.
//
// Only for browsers holding a Supabase login cookie, checked by Vercel
// before starting it. The name is Supabase's sb-<project ref>-auth-token
// (AUTH_COOKIE in lib/session-cookie.ts; this config can't import it), plus
// .0 for a session long enough to be split across cookies. A new Supabase
// project means a new name here.
export const config = {
  matcher: [
    {
      source: "/(notifications|reset-password|artist/[^/]+/edit)",
      has: [{ type: "cookie", key: "sb-ptiwywmprtiardksjgad-auth-token" }],
    },
    {
      source: "/(notifications|reset-password|artist/[^/]+/edit)",
      has: [{ type: "cookie", key: "sb-ptiwywmprtiardksjgad-auth-token.0" }],
    },
  ],
};
