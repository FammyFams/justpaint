import { FeedPage, feedMetadata } from "@/components/feed-page";
import { feedShown } from "@/lib/feed";

export const metadata = feedMetadata;

// The home feed filtered by tag (/?tag=, from the tags on a painting) or
// longer than the first screen (/?shown=, the Load more link search engines
// follow). Built per request; next.config.ts sends those addresses here.
export default async function FilteredFeed({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string; challenge?: string; shown?: string }>;
}) {
  const { tag, challenge, shown } = await searchParams;
  return (
    <FeedPage
      tag={typeof tag === "string" ? tag : undefined}
      challenge={challenge === "october"}
      shown={feedShown(shown)}
    />
  );
}
