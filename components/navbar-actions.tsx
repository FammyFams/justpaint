"use client";

import Link from "next/link";
import { LogOut, Shield, User } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArtistAvatar } from "@/components/artist-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogoutMenuItem } from "@/components/logout-menu-item";
import { NotificationCountProvider, NotificationsMenuItem } from "@/components/notification-count";
import { useViewer } from "@/components/viewer";
import { artistHref } from "@/lib/artist-url";
import { adminLogoutAction } from "@/app/actions/admin";

// Account menu rows: full width and tall enough to tap on a phone.
const MENU_ITEM = "gap-3 rounded-none px-3 py-2.5 focus:bg-secondary";

export function NavbarActions() {
  const { ready, user, admin, unread, refresh } = useViewer();
  const profileHref = user ? artistHref({ id: user.id, displayName: user.displayName }) : "";

  return (
    <div className="flex items-center gap-2">
      {admin && (
        <>
          <Link href="/admin" className={buttonVariants({ size: "sm", variant: "ghost" })}>
            <Shield />
            {/* Icon only on phones, but still named for screen readers. */}
            <span className="sr-only sm:not-sr-only">Admin</span>
          </Link>
          <Button
            type="button"
            size="sm"
            variant="outline"
            aria-label="Exit admin"
            // Redirects to /admin, which may be this page, so ask again
            // instead of waiting for a navigation.
            onClick={() => void adminLogoutAction().then(refresh, refresh)}
          >
            <LogOut />
            <span className="hidden sm:inline">Exit admin</span>
          </Button>
        </>
      )}
      {/* Plain links styled as buttons: rendering them through <Button>
          gave them role="button", so screen readers called them buttons. */}
      <Link
        href="/upload"
        prefetch={false}
        aria-label="Post a painting"
        className={cn(buttonVariants({ size: "lg" }), "rounded-full px-4")}
      >
        <span className="sm:hidden">post</span>
        <span className="hidden sm:inline">post a painting</span>
      </Link>
      {/* Account spot is always last: log in, or the avatar once signed in.
          Until a signed-in browser's account arrives, CSS swaps "log in"
          for a blank avatar (globals.css, data-session). */}
      {!user && (
        <Link
          href="/login"
          prefetch={false}
          data-guest-only=""
          className={cn(buttonVariants({ size: "lg", variant: "ghost" }), "rounded-full px-3")}
        >
          log in
        </Link>
      )}
      {!user && !ready && (
        <span data-session-only="" aria-hidden className="ml-1 size-9 rounded-full bg-muted" />
      )}
      {user && (
        <NotificationCountProvider key={unread} unread={unread}>
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="Account menu"
              className="ml-1 rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <ArtistAvatar name={user.displayName} src={user.avatarUrl} className="size-9" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={6}
              className="w-60 rounded-[4px] border border-border p-0 shadow-[0_1px_0_rgba(0,0,34,0.08)] ring-0"
            >
              <div className="flex items-center gap-3 px-3 py-3">
                <ArtistAvatar name={user.displayName} src={user.avatarUrl} className="size-9" />
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
  );
}
