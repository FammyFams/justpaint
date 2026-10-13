"use server";

import { isAdmin } from "@/lib/admin";
import { getCurrentSession } from "@/lib/current-user";
import { getAllHeartedIds } from "@/lib/hearts";
import { getUnreadCount } from "@/lib/notifications";

export interface Viewer {
  user: { id: string; displayName: string; avatarUrl: string | null } | null;
  admin: boolean;
  /** New notifications, for the account menu. */
  unread: number;
  /** Paintings this account has hearted, so hearts show filled on any device. */
  heartedIds: string[];
  /** The browser sent a login whose session is over; its cookies were just deleted. */
  loggedOut: boolean;
}

/**
 * Who's looking, for the parts of a page that differ per visitor: the
 * navbar's account menu, filled hearts, delete buttons, the comment box.
 * Pages are cached and the same for everyone, so the browser asks for this
 * once per page load, and only when it holds a login or admin cookie
 * (components/viewer.tsx). Guests never call it.
 */
export async function getViewerAction(): Promise<Viewer> {
  const [admin, { user, ended }] = await Promise.all([isAdmin(), getCurrentSession()]);
  if (!user) return { user: null, admin, unread: 0, heartedIds: [], loggedOut: ended };

  const [unread, heartedIds] = await Promise.all([
    getUnreadCount(user.id),
    getAllHeartedIds(user.id),
  ]);
  return {
    user: { id: user.id, displayName: user.displayName, avatarUrl: user.avatarUrl },
    admin,
    unread,
    heartedIds,
    loggedOut: false,
  };
}
