import { cn } from "@/lib/utils";

const pill = "shrink-0 rounded-full border px-3.5 py-1.5 text-sm transition-colors";
const active = "border-primary bg-primary text-primary-foreground";
const inactive =
  "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground";

// Quick sort above the feed: everything, or only October challenge entries.
// Keeps an active ?tag= filter when switching. Plain <a>, not <Link>: these
// addresses are rewritten by their query (next.config.ts), and Next's router
// treats any /?query as the home page it already has, so a <Link> click
// changed the address but kept showing the full feed.
export function FeedFilter({ challenge, tag }: { challenge: boolean; tag?: string }) {
  const href = (october: boolean) => {
    const params = new URLSearchParams();
    if (tag) params.set("tag", tag);
    if (october) params.set("challenge", "october");
    const query = params.toString();
    return query ? `/?${query}` : "/";
  };

  return (
    <div className="flex gap-2">
      <a
        href={href(false)}
        aria-current={challenge ? undefined : "page"}
        className={cn(pill, challenge ? inactive : active)}
      >
        All
      </a>
      <a
        href={href(true)}
        aria-current={challenge ? "page" : undefined}
        className={cn(pill, challenge ? active : inactive)}
      >
        October Challenge 2026
      </a>
    </div>
  );
}
