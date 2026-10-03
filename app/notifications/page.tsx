import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { MarkNotificationsSeen } from "@/components/notification-count";
import { getCurrentUser } from "@/lib/current-user";
import { formatRelativeTime, formatShortDateTime } from "@/lib/format";
import { getNotifications } from "@/lib/notifications";

export const metadata: Metadata = {
  title: "Notifications | justpaint",
  robots: { index: false, follow: false },
};

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/notifications");

  const { items, seenAt } = await getNotifications(user.id);
  const seen = Date.parse(seenAt);

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <MarkNotificationsSeen />
      <h1 className="font-heading text-3xl italic leading-tight">Notifications</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Comments and hearts on your paintings from the last 30 days.
      </p>

      {items.length === 0 ? (
        <p className="mt-8 rounded-[4px] border border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
          Nothing yet. When someone comments on or hearts your paintings, it shows up here.
        </p>
      ) : (
        <ul className="mt-8 divide-y divide-border rounded-[4px] border border-border bg-card shadow-[0_1px_0_rgba(0,0,34,0.08)]">
          {items.map((item) => {
            const isNew = Date.parse(item.at) > seen;
            const href =
              item.kind === "comment"
                ? `/painting/${item.painting.id}#comments`
                : `/painting/${item.painting.id}`;
            return (
              <li key={item.id}>
                <Link href={href} className="flex items-start gap-3 px-4 py-3 hover:bg-secondary">
                  <span className="relative size-14 shrink-0 overflow-hidden rounded-[2px] border border-border bg-muted">
                    {/* 64px like /admin, so these reuse resized copies that already exist. */}
                    <Image src={item.painting.imageUrl} alt="" fill sizes="64px" className="object-cover" />
                  </span>
                  <div className="min-w-0 flex-1 text-sm">
                    {item.kind === "comment" ? (
                      <p className="line-clamp-3">
                        <span className="font-semibold">{item.authorName}</span> commented on{" "}
                        <span className="font-semibold">{item.painting.title}</span>:{" "}
                        <span className="text-foreground/80">&ldquo;{item.body}&rdquo;</span>
                      </p>
                    ) : (
                      <p>
                        <span className="font-semibold">{item.painting.title}</span> got {item.count}{" "}
                        {item.count === 1 ? "heart" : "hearts"}
                      </p>
                    )}
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatRelativeTime(item.at)} ·{" "}
                      <time dateTime={item.at}>{formatShortDateTime(item.at)}</time>
                    </p>
                  </div>
                  {isNew && (
                    <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary">
                      <span className="sr-only">New</span>
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
