import "server-only";
import { revalidatePath } from "next/cache";
import { artistHref } from "@/lib/artist-url";
import { createAdminClient } from "@/lib/supabase/admin";

// Every revalidatePath here costs a page rebuild on the next visit, and
// rebuilds are what use up Vercel's free 4 hours of Active CPU (going over
// pauses the site). Rebuild only the pages that changed: never
// revalidatePath("/", "layout") or "/artist/[id]", which empty the cache for
// the whole site or every profile.

/**
 * Cached pages that list posts. They rebuild on their own every 10 minutes
 * (heart counts), and right away through this when a post is added,
 * removed or moved in or out of the challenge. /feed/october is the October
 * tab of the home feed (/?challenge=october, see next.config.ts rewrites).
 */
export function revalidateFeeds() {
  revalidatePath("/");
  revalidatePath("/feed/october");
  revalidatePath("/october-challenge");
}

/**
 * One person's profile page and its share picture (name, count, latest
 * three). Old /artist/<id> links are cached on their own, so they go too;
 * other capitalizations of the name catch up within 10 minutes.
 */
export function revalidateProfile(userId: string, displayName: string | null | undefined) {
  const href = artistHref({ id: userId, displayName });
  revalidatePath(href);
  revalidatePath(`${href}/opengraph-image`);
  if (href !== `/artist/${userId}`) revalidatePath(`/artist/${userId}`);
}

/** revalidateProfile for callers that only have the id. */
export async function revalidateProfileById(userId: string) {
  const { data } = await createAdminClient()
    .from("profiles")
    .select("display_name")
    .eq("id", userId)
    .maybeSingle();
  revalidateProfile(userId, data?.display_name);
}

/**
 * Painting pages that show this person's name and picture: their own posts
 * and the posts they commented on.
 */
export async function revalidatePaintingsShowing(userId: string) {
  const admin = createAdminClient();
  const [posts, comments] = await Promise.all([
    admin.from("paintings").select("id").eq("owner_id", userId),
    admin.from("comments").select("painting_id").eq("user_id", userId),
  ]);
  const ids = new Set([
    ...(posts.data ?? []).map((p) => p.id),
    ...(comments.data ?? []).map((c) => c.painting_id),
  ]);
  for (const id of ids) revalidatePath(`/painting/${id}`);
}
