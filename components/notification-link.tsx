"use client";

import Link from "next/link";
import { markNotificationTappedAction } from "@/app/actions/notifications";
import { announceUnreadCount } from "@/components/notification-count";

// A row on /notifications. Clicking it opens the painting and marks the
// notification seen (lib/notifications.ts decides how much, TAP_MARKS), then
// updates the account menu's count. Every click is recorded, new or not, so
// either TAP_MARKS setting works without changing this.
export function NotificationLink({
  itemId,
  href,
  className,
  children,
}: {
  itemId: string;
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      prefetch={false}
      className={className}
      onClick={() => {
        markNotificationTappedAction(itemId)
          .then((count) => {
            if (count !== null) announceUnreadCount(count);
          })
          .catch(() => {});
      }}
    >
      {children}
    </Link>
  );
}
