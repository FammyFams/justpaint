import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t border-border/70">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:px-6">
        <p className="flex items-center gap-2 font-heading italic">
          <span className="relative size-5 shrink-0 overflow-hidden rounded-full border border-border bg-card">
            <Image src="/logo.jpg" alt="" fill className="object-cover" sizes="20px" />
          </span>
          justpaint
        </p>
        <div className="flex items-center gap-4">
          <span>&copy; {new Date().getFullYear()} justpaint</span>
          <Link href="/privacy" className="transition-colors hover:text-foreground">
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
}
