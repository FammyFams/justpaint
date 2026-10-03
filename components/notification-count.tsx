"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { markNotificationsSeenAction } from "@/app/actions/notifications";

const SEEN_EVENT = "justpaint:notifications-seen";
const NotificationCountContext = createContext(0);

/**
 * The unread count for the navbar. The navbar lives in the layout, which
 * doesn't re-render on every click, so opening /notifications clears the
 * count with a browser event instead. The navbar keys this by the server's
 * count, so a fresh count from the server starts it over.
 */
export function NotificationCountProvider({
  unread,
  children,
}: {
  unread: number;
  children: React.ReactNode;
}) {
  const [count, setCount] = useState(unread);
  useEffect(() => {
    const clear = () => setCount(0);
    window.addEventListener(SEEN_EVENT, clear);
    return () => window.removeEventListener(SEEN_EVENT, clear);
  }, []);
  return (
    <NotificationCountContext.Provider value={count}>{children}</NotificationCountContext.Provider>
  );
}

export function NotificationsMenuItem({ className }: { className?: string }) {
  const count = useContext(NotificationCountContext);
  return (
    <DropdownMenuItem
      className={className}
      render={
        <Link href="/notifications" prefetch={false}>
          <Bell className="text-muted-foreground" />
          Notifications
          {count > 0 && (
            <span className="ml-auto text-xs font-semibold text-primary">{count} new</span>
          )}
        </Link>
      }
    />
  );
}

/** Rendered by /notifications: marks everything seen once it's on screen. */
export function MarkNotificationsSeen() {
  useEffect(() => {
    window.dispatchEvent(new Event(SEEN_EVENT));
    markNotificationsSeenAction().catch(() => {});
  }, []);
  return null;
}
