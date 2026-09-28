"use client";

import Link, { useLinkStatus } from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

// A real link, not a button, so search engines follow it to older posts.
// It replaces the history entry and keeps the scroll position, so after
// opening a painting, Back returns to the same spot with the same posts.
export function LoadMoreLink({ href }: { href: string }) {
  return (
    <Link
      href={href}
      replace
      scroll={false}
      prefetch={false}
      className={cn(buttonVariants({ variant: "outline" }), "min-w-36")}
    >
      <Label />
    </Link>
  );
}

function Label() {
  const { pending } = useLinkStatus();
  return <>{pending ? "Loading…" : "Load more"}</>;
}
