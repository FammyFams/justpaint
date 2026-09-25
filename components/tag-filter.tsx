import Link from "next/link";
import type { Tag } from "@/lib/types";
import { cn } from "@/lib/utils";

export function TagFilter({
  tags,
  activeTag,
}: {
  tags: Tag[];
  activeTag?: string;
}) {
  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
      <Link
        href="/"
        className={cn(
          "shrink-0 rounded-full border px-3.5 py-1.5 text-sm transition-colors",
          !activeTag
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground"
        )}
      >
        All
      </Link>
      {tags.map((tag) => (
        <Link
          key={tag.id}
          href={`/?tag=${tag.slug}`}
          className={cn(
            "shrink-0 rounded-full border px-3.5 py-1.5 text-sm transition-colors",
            activeTag === tag.slug
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground"
          )}
        >
          {tag.name}
        </Link>
      ))}
    </div>
  );
}
