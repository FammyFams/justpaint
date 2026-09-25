import Link from "next/link";
import Image from "next/image";
import { LogOut, Plus, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isAdmin } from "@/lib/admin";
import { adminLogoutAction } from "@/app/actions/admin";

export async function Navbar() {
  const admin = await isAdmin();

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
                <Button type="submit" size="sm" variant="outline" aria-label="Log out of admin">
                  <LogOut />
                  <span className="hidden sm:inline">Log out</span>
                </Button>
              </form>
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
