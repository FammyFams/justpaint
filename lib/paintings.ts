import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";
import type { Artist, Comment, Painting, Tag } from "@/lib/types";

const PAINTING_SELECT = `
  id, title, description, image_path, aspect, owner_id, guest_name, created_at, heart_count,
  profiles!paintings_owner_id_fkey ( display_name ),
  paintings_tags ( tags ( id, name, slug ) ),
  likes ( count )
`;

interface PaintingRow {
  id: string;
  title: string;
  description: string;
  image_path: string;
  aspect: "portrait" | "landscape" | "square";
  owner_id: string | null;
  guest_name: string | null;
  created_at: string;
  heart_count: number;
  profiles: { display_name: string } | null;
  paintings_tags: { tags: { id: string; name: string; slug: string } | null }[];
  likes: { count: number }[];
}

function toPainting(
  supabase: SupabaseClient<Database>,
  row: PaintingRow
): Painting {
  const imageUrl = supabase.storage
    .from("paintings")
    .getPublicUrl(row.image_path).data.publicUrl;

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    imagePath: row.image_path,
    imageUrl,
    aspect: row.aspect,
    artistId: row.owner_id,
    authorName: row.owner_id
      ? row.profiles?.display_name || "Unknown artist"
      : row.guest_name || "Guest",
    tags: row.paintings_tags
      .map((pt) => pt.tags)
      .filter((t): t is Tag => Boolean(t)),
    // Account likes (paused for now) plus account-free hearts.
    likeCount: (row.likes[0]?.count ?? 0) + row.heart_count,
    createdAt: row.created_at,
  };
}

export async function getFeed(tagSlug?: string): Promise<Painting[]> {
  const supabase = await createClient();

  let paintingIds: string[] | null = null;
  if (tagSlug) {
    // Two-step lookup instead of an embedded !inner filter: filtering the
    // paintings_tags/tags embed directly would also truncate the returned
    // tags array to just the matching tag, which breaks showing a painting's
    // full tag list on a filtered feed.
    const { data: tagRows } = await supabase
      .from("paintings_tags")
      .select("painting_id, tags!inner(slug)")
      .eq("tags.slug", tagSlug);
    paintingIds = (tagRows ?? []).map((r) => r.painting_id);
    if (paintingIds.length === 0) return [];
  }

  let query = supabase
    .from("paintings")
    .select(PAINTING_SELECT)
    .order("created_at", { ascending: false });

  if (paintingIds) {
    query = query.in("id", paintingIds);
  }

  const { data, error } = await query;
  if (error || !data) return [];

  return (data as unknown as PaintingRow[]).map((row) => toPainting(supabase, row));
}

export async function getPaintingById(id: string): Promise<Painting | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("paintings")
    .select(PAINTING_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return toPainting(supabase, data as unknown as PaintingRow);
}

export async function getPaintingsByArtist(artistId: string): Promise<Painting[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("paintings")
    .select(PAINTING_SELECT)
    .eq("owner_id", artistId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return (data as unknown as PaintingRow[]).map((row) => toPainting(supabase, row));
}

interface CommentRow {
  id: string;
  painting_id: string;
  user_id: string;
  body: string;
  created_at: string;
  profiles: { display_name: string } | null;
}

export async function getCommentsForPainting(paintingId: string): Promise<Comment[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("comments")
    .select("id, painting_id, user_id, body, created_at, profiles ( display_name )")
    .eq("painting_id", paintingId)
    .order("created_at", { ascending: true });

  if (error || !data) return [];
  return (data as unknown as CommentRow[]).map((row) => ({
    id: row.id,
    paintingId: row.painting_id,
    authorId: row.user_id,
    authorName: row.profiles?.display_name || "Someone",
    body: row.body,
    createdAt: row.created_at,
  }));
}

export async function getAllTags(): Promise<Tag[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("tags").select("id, name, slug").order("name");
  return data ?? [];
}

export async function getArtistById(id: string): Promise<Artist | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, bio, created_at")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return {
    id: data.id,
    displayName: data.display_name || "Unnamed artist",
    bio: data.bio || "",
    joinedAt: data.created_at,
  };
}

export async function hasUserLiked(paintingId: string, userId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("likes")
    .select("painting_id")
    .eq("painting_id", paintingId)
    .eq("user_id", userId)
    .maybeSingle();
  return Boolean(data);
}
