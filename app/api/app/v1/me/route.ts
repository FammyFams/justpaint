import { getBearerUserId } from "@/lib/api/auth";
import { busy, json, unauthorized } from "@/lib/api/respond";
import { createPublicClient } from "@/lib/supabase/public";

// The signed-in app user's profile. The app also uses it to check its token works.
export async function GET(request: Request) {
  const userId = await getBearerUserId(request);
  if (!userId) return unauthorized();

  const { data, error } = await createPublicClient()
    .from("profiles")
    .select("id, display_name, bio, created_at")
    .eq("id", userId)
    .maybeSingle();
  if (error) return busy();

  return json({
    user: {
      id: userId,
      displayName: data?.display_name ?? null,
      bio: data?.bio ?? "",
      joinedAt: data?.created_at ?? null,
    },
  });
}
