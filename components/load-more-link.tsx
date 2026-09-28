"use client";

import { useEffect, useRef, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

// A real link, not a button, so search engines follow it to older posts.
// It replaces the history entry and keeps the scroll position, so after
// opening a painting, Back returns to the same spot with the same posts.
// It also follows itself when the visitor scrolls near it, so the feed keeps
// loading on its own; tapping it still works if that doesn't fire.
export function LoadMoreLink({ href }: { href: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const ref = useRef<HTMLAnchorElement>(null);

  function load() {
    startTransition(() => router.replace(href, { scroll: false }));
  }

  // Start a little before the link comes into view. A new href means the
  // last batch arrived, so the observer is set up again for the next one.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let fired = false;
    const observer = new IntersectionObserver(
      (entries) => {
        if (fired || !entries[0].isIntersecting) return;
        fired = true;
        startTransition(() => router.replace(href, { scroll: false }));
      },
      { rootMargin: "800px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [href, router]);

  return (
    <Link
      ref={ref}
      href={href}
      replace
      scroll={false}
      prefetch={false}
      onClick={(e) => {
        e.preventDefault();
        load();
      }}
      aria-disabled={pending}
      className={cn(buttonVariants({ variant: "outline" }), "min-w-36")}
    >
      {pending ? "Loading…" : "Load more"}
    </Link>
  );
}
