import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { visitorKey } from "@/lib/client-ip";

// Comments and hearts on someone's paintings, for /notifications. Nothing
// is stored per notification: they're read straight from comments and
// painting_hearts. notification_reads only remembers when the person last
// looked (migration 20261003000002).

const WINDOW_DAYS = 30;
const MAX_ITEMS = 50;
// Before someone first opens the page, the last week counts as new. Matches
// unread_notification_count().
const FIRST_VISIT_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

export interface NotifiedPainting {
  id: string;
  title: string;
  imageUrl: string;
}

export type Notification =
  | {
      kind: "comment";
      id: string;
      at: string;
      painting: NotifiedPainting;
      authorName: string;
      body: string;
    }
  | {
      kind: "hearts";
      id: string;
      /** The newest heart in the group. */
      at: string;
      painting: NotifiedPainting;
      count: number;
    };

interface PaintingEmbed {
  id: string;
  title: string;
  image_path: string;
}

// Hearts are grouped per painting per day, in Pacific time like the rest of
// the site.
function pacificDay(iso: string): string {
  return new Date(iso).toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" });
}

export async function getNotifications(
  userId: string
): Promise<{ items: Notification[]; seenAt: string }> {
  const admin = createAdminClient();
  const since = new Date(Date.now() - WINDOW_DAYS * DAY_MS).toISOString();
  // Hearts from this account are stored under this key; leave those out.
  const ownHeartKey = await visitorKey(userId);

  const [seen, comments, hearts] = await Promise.all([
    admin.from("notification_reads").select("seen_at").eq("user_id", userId).maybeSingle(),
    admin
      .from("comments")
      .select("id, body, created_at, profiles ( display_name ), paintings!inner ( id, title, image_path, owner_id )")
      .eq("paintings.owner_id", userId)
      .neq("user_id", userId)
      .gt("created_at", since)
      .order("created_at", { ascending: false })
      .limit(MAX_ITEMS),
    admin
      .from("painting_hearts")
      .select("created_at, paintings!inner ( id, title, image_path, owner_id )")
      .eq("paintings.owner_id", userId)
      .neq("ip_hash", ownHeartKey)
      .gt("created_at", since)
      .order("created_at", { ascending: false })
      .limit(1000),
  ]);

  if (comments.error) console.error("notifications: comments failed", comments.error);
  if (hearts.error) console.error("notifications: hearts failed", hearts.error);

  const toPainting = (p: PaintingEmbed): NotifiedPainting => ({
    id: p.id,
    title: p.title,
    imageUrl: admin.storage.from("paintings").getPublicUrl(p.image_path).data.publicUrl,
  });

  const items: Notification[] = (comments.data ?? []).map((c) => ({
    kind: "comment",
    id: `comment:${c.id}`,
    at: c.created_at,
    painting: toPainting(c.paintings as PaintingEmbed),
    authorName: (c.profiles as { display_name: string } | null)?.display_name || "Someone",
    body: c.body,
  }));

  // Newest first, so the first heart seen in each group is its newest.
  const groups = new Map<string, Extract<Notification, { kind: "hearts" }>>();
  for (const h of hearts.data ?? []) {
    const painting = h.paintings as PaintingEmbed;
    const key = `${painting.id}:${pacificDay(h.created_at)}`;
    const group = groups.get(key);
    if (group) {
      group.count += 1;
    } else {
      groups.set(key, { kind: "hearts", id: `hearts:${key}`, at: h.created_at, painting: toPainting(painting), count: 1 });
    }
  }
  items.push(...groups.values());
  items.sort((a, b) => Date.parse(b.at) - Date.parse(a.at));

  // Before the migration (or on any error) fall back to the first-visit window.
  const seenAt =
    seen.data?.seen_at ?? new Date(Date.now() - FIRST_VISIT_DAYS * DAY_MS).toISOString();

  return { items: items.slice(0, MAX_ITEMS), seenAt };
}

/** How many notifications are new, for the account menu. 0 on any error. */
export async function getUnreadCount(userId: string): Promise<number> {
  const { data, error } = await createAdminClient().rpc("unread_notification_count", {
    p_user: userId,
    p_own_heart_key: await visitorKey(userId),
  });
  if (error) {
    if (error.code === "PGRST202") {
      console.error("unread_notification_count missing: apply migration 20261003000002");
    } else {
      console.error("unread_notification_count failed", error);
    }
    return 0;
  }
  return data ?? 0;
}
