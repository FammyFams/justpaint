import { cn } from "@/lib/utils";
import { CHALLENGES } from "@/lib/challenges";

const pill = "shrink-0 rounded-full border px-3.5 py-1.5 text-sm transition-colors";
const active = "border-primary bg-primary text-primary-foreground";
const inactive =
  "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground";

// Quick sort above the feed: everything, or one challenge's entries (newest
// challenge first). Keeps an active ?tag= filter when switching. Plain <a>,
// not <Link>: these addresses are rewritten by their query (next.config.ts),
// and Next's router treats any /?query as the home page it already has, so
// a <Link> click changed the address but kept showing the full feed.
export function FeedFilter({ challenge, tag }: { challenge?: string; tag?: string }) {
  const href = (slug?: string) => {
    const params = new URLSearchParams();
    if (tag) params.set("tag", tag);
    if (slug) params.set("challenge", slug);
    const query = params.toString();
    return query ? `/?${query}` : "/";
  };

  return (
    <div className="flex flex-wrap gap-2">
      <a
        href={href()}
        aria-current={challenge ? undefined : "page"}
        className={cn(pill, challenge ? inactive : active)}
      >
        All
      </a>
      {CHALLENGES.map((c) => (
        <a
          key={c.slug}
          href={href(c.slug)}
          aria-current={challenge === c.slug ? "page" : undefined}
          className={cn(pill, challenge === c.slug ? active : inactive)}
        >
          {c.tabName}
        </a>
      ))}
    </div>
  );
}
