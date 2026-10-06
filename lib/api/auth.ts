import { createPublicClient } from "@/lib/supabase/public";

// The app (iPhone/Android) has no cookies: it sends its Supabase access token
// as "Authorization: Bearer <token>". getClaims verifies the token's signature
// and expiry, then this returns the signed-in user's id. Null for a missing,
// expired or forged token, so the route answers 401.
export async function getBearerUserId(request: Request): Promise<string | null> {
  const token = request.headers.get("authorization")?.match(/^Bearer\s+(\S+)$/i)?.[1];
  if (!token) return null;

  const { data, error } = await createPublicClient().auth.getClaims(token);
  const claims = data?.claims;
  // Anonymous sessions aren't accounts, so they can't post, heart or comment.
  if (error || !claims?.sub || claims.is_anonymous) return null;
  return claims.sub;
}
