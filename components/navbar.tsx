import Link from "next/link";
import Image from "next/image";
import { LogOut, Shield } from "lucide-react";
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
import { isAdmin } from "@/lib/admin";
import { getCurrentUser } from "@/lib/current-user";
import { getAvatarClasses, getInitials } from "@/lib/format";
import { adminLogoutAction } from "@/app/actions/admin";

export async function Navbar() {
  const [admin, user] = await Promise.all([isAdmin(), getCurrentUser()]);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="group flex items-center gap-2 font-heading text-2xl italic tracking-tight text-foreground"
        >
          <span className="relative size-9 shrink-0 overflow-hidden rounded-full border border-border bg-card transition-transform duration-300 group-hover:-rotate-6">
            <Image
              src="/logo.jpg"
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
          {!user && (
            <Button
              size="lg"
              variant="ghost"
              nativeButton={false}
              className="rounded-full px-3"
              render={<Link href="/login">log in</Link>}
            />
          )}
          <Button
            size="lg"
            nativeButton={false}
            className="rounded-full px-4"
            render={
              <Link href="/upload" aria-label="Post a painting">
                <span className="sm:hidden">post</span>
                <span className="hidden sm:inline">post a painting</span>
              </Link>
            }
          />
          {user && (
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
              <DropdownMenuContent align="end" className="min-w-44">
                <div className="px-1.5 py-1 text-sm font-medium">{user.displayName}</div>
                <DropdownMenuSeparator />
                <DropdownMenuItem render={<Link href={`/artist/${user.id}`}>My profile</Link>} />
                <DropdownMenuItem
                  render={<Link href={`/artist/${user.id}/edit`}>Edit profile</Link>}
                />
                <DropdownMenuSeparator />
                <LogoutMenuItem />
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
