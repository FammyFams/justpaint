import Link from "next/link";
import { Palette, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
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
          <Button
            variant="ghost"
            size="sm"
            className="hidden sm:inline-flex"
            nativeButton={false}
            render={<Link href="/login">Log in</Link>}
          />
          <Button
            size="sm"
            className="hidden sm:inline-flex"
            nativeButton={false}
            render={<Link href="/signup">Sign up</Link>}
          />
          <Button
            size="icon"
            variant="secondary"
            className="sm:hidden"
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
