"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

const COUNT_EVENT = "justpaint:notification-count";
const NotificationCountContext = createContext(0);

/**
 * The unread count for the navbar. The navbar lives in the layout, which
 * doesn't re-render on every click, so clicking a notification sends the new
 * count with a browser event instead (announceUnreadCount). The navbar keys
 * this by the server's count, so a fresh count from the server starts it over.
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
    const update = (event: Event) => setCount((event as CustomEvent<number>).detail);
    window.addEventListener(COUNT_EVENT, update);
    return () => window.removeEventListener(COUNT_EVENT, update);
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

/** Sets the account menu's unread count, after a notification is clicked. */
export function announceUnreadCount(count: number) {
  window.dispatchEvent(new CustomEvent(COUNT_EVENT, { detail: count }));
}
