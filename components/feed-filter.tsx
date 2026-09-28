import Link from "next/link";
import { cn } from "@/lib/utils";

const pill = "shrink-0 rounded-full border px-3.5 py-1.5 text-sm transition-colors";
const active = "border-primary bg-primary text-primary-foreground";
const inactive =
  "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground";

// Quick sort above the feed: everything, or only October challenge entries.
// Keeps an active ?tag= filter when switching.
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
      <Link href={href(false)} className={cn(pill, challenge ? inactive : active)}>
        All
      </Link>
      <Link href={href(true)} className={cn(pill, challenge ? active : inactive)}>
        October Challenge
      </Link>
    </div>
  );
}
