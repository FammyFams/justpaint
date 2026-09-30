import { createClient as createPublicClient, type SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";
import type { Artist, Comment, Painting, Tag } from "@/lib/types";
import { artistSlug, isUuid } from "@/lib/artist-url";

const PAINTING_SELECT = `
  id, title, description, image_path, aspect, owner_id, guest_name, created_at, heart_count,
  october_challenge, october_day,
  profiles!paintings_owner_id_fkey ( display_name ),
  paintings_tags ( tags ( id, name, slug ) )
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
  october_challenge: boolean;
  october_day: number | null;
  profiles: { display_name: string } | null;
  paintings_tags: { tags: { id: string; name: string; slug: string } | null }[];
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
    // Hearts only; the old account "likes" table is retired (writes revoked
    // in migration 20260926000002).
    likeCount: row.heart_count,
    createdAt: row.created_at,
    octoberChallenge: row.october_challenge,
    octoberDay: row.october_day,
  };
}

// A failed query means Supabase is down or over a limit. Throwing shows
// app/error.tsx ("The server is busy") instead of an empty wall or a 404.
function throwBusy(where: string, error: { message: string }): never {
  throw new Error(`${where} failed: ${error.message}`);
}

// A malformed id in the URL (not a uuid) is a missing page, not an outage.
function isBadId(error: { code?: string }) {
  return error.code === "22P02";
}

export interface FeedPage {
  paintings: Painting[];
  /** More posts exist past this page. */
  hasMore: boolean;
  /** Every matching post, not just this page. Only set when asked for. */
  total?: number;
}

export async function getFeed({
  tag: tagSlug,
  octoberChallenge = false,
  limit,
  withCount = false,
}: {
  tag?: string;
  octoberChallenge?: boolean;
  limit: number;
  withCount?: boolean;
}): Promise<FeedPage> {
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
    if (paintingIds.length === 0) return { paintings: [], hasMore: false, total: 0 };
  }

  // One extra row tells us whether there are more posts past this page.
  let query = supabase
    .from("paintings")
    .select(PAINTING_SELECT, withCount ? { count: "exact" } : undefined);

  if (paintingIds) {
    query = query.in("id", paintingIds);
  }
  if (octoberChallenge) {
    // Grouped by prompt day, newest day first; posts with no day go last.
    query = query
      .eq("october_challenge", true)
      .order("october_day", { ascending: false, nullsFirst: false });
  }
  query = query.order("created_at", { ascending: false }).limit(limit + 1);

  const { data, error, count } = await query;
  if (error) throwBusy("getFeed", error);
  const rows = (data ?? []) as unknown as PaintingRow[];

  return {
    paintings: rows.slice(0, limit).map((row) => toPainting(supabase, row)),
    hasMore: rows.length > limit,
    total: withCount ? (count ?? 0) : undefined,
  };
}

export async function getPaintingById(id: string): Promise<Painting | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("paintings")
    .select(PAINTING_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error && !isBadId(error)) throwBusy("getPaintingById", error);
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

  if (error && !isBadId(error)) throwBusy("getPaintingsByArtist", error);
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

  if (error && !isBadId(error)) throwBusy("getArtistById", error);
  if (error || !data) return null;
  return {
    id: data.id,
    displayName: data.display_name || "Unnamed artist",
    bio: data.bio || "",
    joinedAt: data.created_at,
  };
}

export interface SitemapPainting {
  id: string;
  createdAt: string;
  /** The account that posted it; null for guest posts. */
  artist: { id: string; displayName: string } | null;
}

/**
 * Every painting's id, post date and account, newest first, for the
 * sitemap. Uses a cookie-free client so the sitemap can be cached instead
 * of built per request.
 */
export async function getSitemapPaintings(): Promise<SitemapPainting[]> {
  const supabase = createPublicClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
  // Supabase returns at most 1000 rows per request, so read in chunks.
  const CHUNK = 1000;
  const rows: {
    id: string;
    created_at: string;
    owner_id: string | null;
    profiles: { display_name: string } | null;
  }[] = [];
  for (let from = 0; from < 50000; from += CHUNK) {
    const { data, error } = await supabase
      .from("paintings")
      .select("id, created_at, owner_id, profiles!paintings_owner_id_fkey ( display_name )")
      .order("created_at", { ascending: false })
      .range(from, from + CHUNK - 1);
    if (error) throwBusy("getSitemapPaintings", error);
    rows.push(...((data ?? []) as unknown as typeof rows));
    if (!data || data.length < CHUNK) break;
  }
  return rows.map((row) => ({
    id: row.id,
    createdAt: row.created_at,
    artist: row.owner_id
      ? { id: row.owner_id, displayName: row.profiles?.display_name ?? "" }
      : null,
  }));
}

/**
 * Finds a profile by its address name (see lib/artist-url.ts). A dash in
 * the address can stand for a space or a dash in the name, so this matches
 * either and then checks the exact address.
 */
export async function getArtistBySlug(slug: string): Promise<Artist | null> {
  if (!/^[A-Za-z0-9._-]{1,60}$/.test(slug)) return null;
  const wanted = slug.toLowerCase();
  const supabase = await createClient();
  // In ilike, "_" matches any one character; escape real underscores first.
  const pattern = slug.replace(/_/g, "\\_").replace(/-/g, "_");
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, bio, created_at")
    .ilike("display_name", pattern)
    .order("created_at", { ascending: true })
    .limit(10);

  if (error) throwBusy("getArtistBySlug", error);
  const matches = (data ?? []).filter((row) => artistSlug(row.display_name ?? "").toLowerCase() === wanted);
  // "Ash W" and "ash-w" would share an address; the name that's spelled
  // exactly like the address wins, then the older account.
  const row =
    matches.find((r) => r.display_name?.trim().toLowerCase() === wanted) ?? matches[0];
  if (!row) return null;
  return {
    id: row.id,
    displayName: row.display_name || "Unnamed artist",
    bio: row.bio || "",
    joinedAt: row.created_at,
  };
}

/** A profile from its address: the name (see lib/artist-url.ts) or an old id link. */
export async function findArtist(handle: string): Promise<Artist | null> {
  return isUuid(handle) ? getArtistById(handle) : getArtistBySlug(handle);
}
