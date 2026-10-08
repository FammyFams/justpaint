import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { visitorKey } from "@/lib/client-ip";
import { fail, type WriteFailure } from "@/lib/writes/result";

// Comments and hearts on someone's paintings, for /notifications and the
// app's Activity tab. Nothing is stored per notification: they're read
// straight from comments and painting_hearts. A notification stops being new
// when it's tapped (app) or clicked (website): notification_taps remembers
// those (migration 20261007000001). notification_reads.seen_at is an older
// "everything before this is seen" mark (migration 20261003000002).

// What a tap or click on a notification marks seen:
//   "notification"  just that one
//   "painting"      every notification about that painting
// Change it here and push: the website, the app and the badge count all
// follow, and no data needs moving (taps keep both the notification and its
// painting).
export const TAP_MARKS: "notification" | "painting" = "notification";

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
      /** comment:<comment id> */
      id: string;
      at: string;
      painting: NotifiedPainting;
      /** Not tapped yet (see TAP_MARKS) and after seen_at. */
      new: boolean;
      authorName: string;
      body: string;
    }
  | {
      kind: "hearts";
      /** hearts:<painting id>:<YYYY-MM-DD, Pacific day> */
      id: string;
      /** The newest heart in the group. */
      at: string;
      painting: NotifiedPainting;
      new: boolean;
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

  const [seen, taps, comments, hearts, blocks] = await Promise.all([
    admin.from("notification_reads").select("seen_at").eq("user_id", userId).maybeSingle(),
    // A tap always comes after its notification, so older taps can't matter.
    admin
      .from("notification_taps")
      .select("item_id, painting_id, tapped_at")
      .eq("user_id", userId)
      .gt("tapped_at", since),
    admin
      .from("comments")
      .select("id, user_id, body, created_at, profiles ( display_name ), paintings!inner ( id, title, image_path, owner_id )")
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
    // People this account blocked in the app (at most 1,000).
    admin.from("user_blocks").select("blocked_id").eq("blocker_id", userId),
  ]);

  if (comments.error) console.error("notifications: comments failed", comments.error);
  if (hearts.error) console.error("notifications: hearts failed", hearts.error);
  if (taps.error) console.error("notifications: taps failed", taps.error);
  if (blocks.error) console.error("notifications: blocks failed", blocks.error);

  const toPainting = (p: PaintingEmbed): NotifiedPainting => ({
    id: p.id,
    title: p.title,
    imageUrl: admin.storage.from("paintings").getPublicUrl(p.image_path).data.publicUrl,
  });

  // Blocked people's comments don't notify you; unread_notification_count()
  // leaves them out the same way. Hearts carry no name, so they stay.
  const blocked = new Set((blocks.data ?? []).map((b) => b.blocked_id));
  const items: Notification[] = (comments.data ?? [])
    .filter((c) => !blocked.has(c.user_id))
    .map((c) => ({
      kind: "comment",
      id: `comment:${c.id}`,
      at: c.created_at,
      painting: toPainting(c.paintings as PaintingEmbed),
      new: false,
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
      groups.set(key, {
        kind: "hearts",
        id: `hearts:${key}`,
        at: h.created_at,
        painting: toPainting(painting),
        new: false,
        count: 1,
      });
    }
  }
  items.push(...groups.values());
  items.sort((a, b) => Date.parse(b.at) - Date.parse(a.at));

  // Before the migration (or on any error) fall back to the first-visit window.
  const seenAt =
    seen.data?.seen_at ?? new Date(Date.now() - FIRST_VISIT_DAYS * DAY_MS).toISOString();

  // New until tapped, the same rule as unread_notification_count(). A tap
  // covers what had arrived by then, so later hearts that day count again.
  const seenMs = Date.parse(seenAt);
  for (const item of items) {
    const at = Date.parse(item.at);
    item.new =
      at > seenMs &&
      !(taps.data ?? []).some(
        (t) =>
          Date.parse(t.tapped_at) >= at &&
          (t.item_id === item.id || (TAP_MARKS === "painting" && t.painting_id === item.painting.id))
      );
  }

  return { items: items.slice(0, MAX_ITEMS), seenAt };
}

const UUID = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";
const COMMENT_ID = new RegExp(`^comment:(${UUID})$`, "i");
const HEARTS_ID = new RegExp(`^hearts:(${UUID}):\\d{4}-\\d{2}-\\d{2}$`, "i");

/**
 * Remembers that the person tapped (app) or clicked (website) one of their
 * notifications; TAP_MARKS decides how much that marks seen. Only
 * notifications about their own paintings. Returns the new unread count.
 */
export async function markNotificationTapped(
  userId: string,
  itemId: string
): Promise<WriteFailure | { ok: true; unreadCount: number }> {
  const gone = fail("not_found", "That notification is gone.");
  const admin = createAdminClient();

  let paintingId: string | undefined;
  const comment = COMMENT_ID.exec(itemId);
  const hearts = HEARTS_ID.exec(itemId);
  if (comment) {
    const { data } = await admin.from("comments").select("painting_id").eq("id", comment[1]).maybeSingle();
    paintingId = data?.painting_id;
  } else if (hearts) {
    paintingId = hearts[1];
  } else {
    return fail("invalid", "That isn't a notification.");
  }
  if (!paintingId) return gone;

  const { data: painting } = await admin
    .from("paintings")
    .select("owner_id")
    .eq("id", paintingId)
    .maybeSingle();
  if (!painting) return gone;
  if (painting.owner_id !== userId) return fail("forbidden", "That isn't one of your notifications.");

  const { error } = await admin.from("notification_taps").upsert({
    user_id: userId,
    item_id: itemId,
    painting_id: paintingId,
    tapped_at: new Date().toISOString(),
  });
  if (error) {
    console.error("markNotificationTapped failed", error);
    return fail("busy", "Couldn't save that. Try again.");
  }
  return { ok: true, unreadCount: await getUnreadCount(userId) };
}

/**
 * Marks everything up to now as seen, for /notifications and the app's
 * Activity tab. The new time, or null if it couldn't be saved.
 */
export async function markNotificationsSeen(userId: string): Promise<string | null> {
  const seenAt = new Date().toISOString();
  const { error } = await createAdminClient()
    .from("notification_reads")
    .upsert({ user_id: userId, seen_at: seenAt });
  if (error) {
    console.error("markNotificationsSeen failed", error);
    return null;
  }
  return seenAt;
}

/** How many notifications are new, for the account menu. 0 on any error. */
export async function getUnreadCount(userId: string): Promise<number> {
  const { data, error } = await createAdminClient().rpc("unread_notification_count", {
    p_user: userId,
    p_own_heart_key: await visitorKey(userId),
    p_by_painting: TAP_MARKS === "painting",
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
