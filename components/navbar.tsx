import Link from "next/link";
import { Palette, Plus } from "lucide-react";
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
import { getCurrentUser } from "@/lib/current-user";
import { getAvatarClasses, getInitials } from "@/lib/format";

export async function Navbar() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="group flex items-center gap-2 font-heading text-2xl italic tracking-tight text-foreground"
        >
          <Palette className="size-5 text-primary transition-transform duration-300 group-hover:-rotate-12" />
          justpaint
        </Link>

        <nav className="hidden items-center gap-6 font-medium text-sm text-muted-foreground sm:flex">
          <Link href="/" className="transition-colors hover:text-foreground">
            Gallery
          </Link>
          <Link
            href="/upload"
            className="transition-colors hover:text-foreground"
          >
            Upload
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring/50">
                <Avatar className="size-8">
                  <AvatarFallback className={getAvatarClasses(user.displayName)}>
                    {getInitials(user.displayName)}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="px-1.5 py-1 text-sm font-medium">
                  {user.displayName}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  render={<Link href={`/artist/${user.id}`}>My profile</Link>}
                />
                <DropdownMenuItem
                  render={<Link href={`/artist/${user.id}/edit`}>Edit profile</Link>}
                />
                <DropdownMenuSeparator />
                <LogoutMenuItem />
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                nativeButton={false}
                render={<Link href="/login">Log in</Link>}
              />
              <Button
                size="sm"
                nativeButton={false}
                render={<Link href="/signup">Sign up</Link>}
              />
            </>
          )}
          <Button
            size="icon"
            variant="secondary"
            nativeButton={false}
            render={
              <Link href="/upload" aria-label="Upload a painting">
                <Plus />
              </Link>
            }
          />
        </div>
      </div>
    </header>
  );
}
