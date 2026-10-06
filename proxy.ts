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

// Only for browsers holding a Supabase login cookie: there's no session to
// refresh otherwise. Every run of this counts toward Vercel's free 4 hours
// of server CPU a month, and before this it ran on every request, guests
// and cached pages included. Vercel checks the cookie before starting it.
//
// The name is Supabase's sb-<project ref>-auth-token (AUTH_COOKIE in
// lib/session-cookie.ts; this config can't import it), plus .0 for a
// session long enough to be split across cookies. A new Supabase project
// means a new name here. Static files and images are skipped either way.
export const config = {
  matcher: [
    {
      source: "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|ico|txt|xml)$).*)",
      has: [{ type: "cookie", key: "sb-ptiwywmprtiardksjgad-auth-token" }],
    },
    {
      source: "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|ico|txt|xml)$).*)",
      has: [{ type: "cookie", key: "sb-ptiwywmprtiardksjgad-auth-token.0" }],
    },
  ],
};
