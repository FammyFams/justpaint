import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Music2, Palette, Play, Store } from "lucide-react";

export const metadata: Metadata = {
  title: "Links — justpaint",
  description: "Find itsthew on Etsy, TikTok, YouTube, and justpaint.",
};

const LINKS = [
  {
    label: "Etsy",
    handle: "itsThew",
    href: "https://www.etsy.com/shop/itsThew",
    icon: Store,
  },
  {
    label: "TikTok",
    handle: "@its.thew",
    href: "https://www.tiktok.com/@its.thew",
    icon: Music2,
  },
  {
    label: "YouTube",
    handle: "@Thewpaints",
    href: "https://www.youtube.com/@Thewpaints",
    icon: Play,
  },
] as const;

const rowClass =
  "group flex items-center gap-4 rounded-sm border border-border/70 bg-card px-4 py-3.5 shadow-[0_1px_2px_rgba(32,26,19,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_10px_24px_-12px_rgba(32,26,19,0.25)]";

export default function LinksPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-4 py-12">
      <span className="relative size-24 overflow-hidden rounded-full border border-border bg-card shadow-sm">
        <Image src="/logo.jpg" alt="" fill className="object-cover" sizes="96px" priority />
      </span>
      <h1 className="mt-4 font-heading text-3xl italic">itsthew</h1>
      <p className="mt-1 text-sm text-muted-foreground">Everywhere I post.</p>

      <ul className="mt-8 flex w-full flex-col gap-3">
        <li>
          <Link href="/" className={rowClass}>
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Palette className="size-5" />
            </span>
            <span className="flex-1">
              <span className="block font-medium">justpaint</span>
              <span className="block text-sm text-muted-foreground">justpaint.art</span>
            </span>
            <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </li>
        {LINKS.map(({ label, handle, href, icon: Icon }) => (
          <li key={label}>
            <a href={href} target="_blank" rel="noopener noreferrer" className={rowClass}>
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                <Icon className="size-5" />
              </span>
              <span className="flex-1">
                <span className="block font-medium">{label}</span>
                <span className="block text-sm text-muted-foreground">{handle}</span>
              </span>
              <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}
