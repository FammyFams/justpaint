import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
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
    </header>
  );
}
