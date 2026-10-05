import Link from "next/link";
import { artistHref } from "@/lib/artist-url";
import Image from "next/image";
import { LogOut, Shield, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogoutMenuItem } from "@/components/logout-menu-item";
import { NotificationCountProvider, NotificationsMenuItem } from "@/components/notification-count";
import { isAdmin } from "@/lib/admin";
import { getCurrentUser } from "@/lib/current-user";
import { getAvatarClasses, getInitials } from "@/lib/format";
import { getUnreadCount } from "@/lib/notifications";
import { adminLogoutAction } from "@/app/actions/admin";

// Account menu rows: full width and tall enough to tap on a phone.
const MENU_ITEM = "gap-3 rounded-none px-3 py-2.5 focus:bg-secondary";

export async function Navbar() {
  const [admin, user] = await Promise.all([isAdmin(), getCurrentUser()]);
  const profileHref = user ? artistHref({ id: user.id, displayName: user.displayName }) : "";
  const unread = user ? await getUnreadCount(user.id) : 0;

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* No prefetch on the navbar links: they're on every page, so each
            visit loaded /, /upload and /login in the background, about 3,000
            requests a day toward Vercel's free 1M a month. */}
        <Link
          href="/"
          prefetch={false}
          className="group flex items-center gap-2 font-heading text-2xl italic tracking-tight text-foreground"
        >
          <span className="relative size-9 shrink-0 overflow-hidden rounded-full border border-border bg-card transition-transform duration-300 group-hover:-rotate-6">
            <Image
              src="/logo.jpg"
              unoptimized
              alt=""
              fill
              className="object-cover"
              sizes="36px"
            />
          </span>
          justpaint
        </Link>

        <div className="flex items-center gap-2">
          {admin && (
            <>
              <Button
                size="sm"
                variant="ghost"
                nativeButton={false}
                render={
                  <Link href="/admin">
                    <Shield />
                    <span className="hidden sm:inline">Admin</span>
                  </Link>
                }
              />
              <form action={adminLogoutAction}>
                <Button type="submit" size="sm" variant="outline" aria-label="Exit admin">
                  <LogOut />
                  <span className="hidden sm:inline">Exit admin</span>
                </Button>
              </form>
            </>
          )}
          <Button
            size="lg"
            nativeButton={false}
            className="rounded-full px-4"
            render={
              <Link href="/upload" prefetch={false} aria-label="Post a painting">
                <span className="sm:hidden">post</span>
                <span className="hidden sm:inline">post a painting</span>
              </Link>
            }
          />
          {/* Account spot is always last: log in, or the avatar once signed in. */}
          {!user && (
            <Button
              size="lg"
              variant="ghost"
              nativeButton={false}
              className="rounded-full px-3"
              render={<Link href="/login" prefetch={false}>log in</Link>}
            />
          )}
          {user && (
            <NotificationCountProvider key={unread} unread={unread}>
              <DropdownMenu>
                <DropdownMenuTrigger
                  aria-label="Account menu"
                  className="ml-1 rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <Avatar className="size-9">
                    <AvatarFallback className={getAvatarClasses(user.displayName)}>
                      {getInitials(user.displayName)}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  sideOffset={6}
                  className="w-60 rounded-[4px] border border-border p-0 shadow-[0_1px_0_rgba(0,0,34,0.08)] ring-0"
                >
                  <div className="flex items-center gap-3 px-3 py-3">
                    <Avatar className="size-9">
                      <AvatarFallback className={getAvatarClasses(user.displayName)}>
                        {getInitials(user.displayName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 text-sm">
                      <p className="truncate font-semibold">{user.displayName}</p>
                      <p className="truncate text-xs text-muted-foreground">justpaint.art{profileHref}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator className="mx-0 my-0" />
                  <div className="py-1">
                    <DropdownMenuItem
                      className={MENU_ITEM}
                      render={
                        <Link href={profileHref}>
                          <User className="text-muted-foreground" />
                          My profile
                        </Link>
                      }
                    />
                    <NotificationsMenuItem className={MENU_ITEM} />
                  </div>
                  <DropdownMenuSeparator className="mx-0 my-0" />
                  <div className="py-1">
                    <LogoutMenuItem className={MENU_ITEM} />
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </NotificationCountProvider>
          )}
        </div>
      </div>
    </header>
  );
}
