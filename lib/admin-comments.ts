import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export interface AdminComment {
  id: string;
  body: string;
  createdAt: string;
  authorId: string;
  authorName: string;
  paintingId: string;
  paintingTitle: string;
}

/** The newest comments across the site, for the admin comment feed. */
export async function getLatestComments(limit = 50): Promise<AdminComment[]> {
  const { data, error } = await createAdminClient()
    .from("comments")
    .select("id, body, created_at, user_id, painting_id, profiles ( display_name ), paintings ( title )")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`getLatestComments failed: ${error.message}`);
  return (data ?? []).map((row) => ({
    id: row.id,
    body: row.body,
    createdAt: row.created_at,
    authorId: row.user_id,
    authorName: row.profiles?.display_name || "Someone",
    paintingId: row.painting_id,
    paintingTitle: row.paintings?.title ?? "a deleted post",
  }));
}
