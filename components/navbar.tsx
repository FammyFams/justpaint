import Link from "next/link";
import Image from "next/image";
import { NavbarActions } from "@/components/navbar-actions";

// Reads no cookies, so pages stay cacheable. The buttons on the right depend
// on who's looking and fill in from the browser (navbar-actions.tsx).
export function Navbar() {
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
          <span className="relative size-9 shrink-0 overflow-hidden rounded-full border border-border bg-card transition-transform duration-300 motion-safe:group-hover:-rotate-6">
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

        <NavbarActions />
      </div>
    </header>
  );
}
