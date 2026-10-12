import { FeedPage, feedMetadata } from "@/components/feed-page";

export const metadata = feedMetadata;

// Cached and the same for everyone. New and removed posts show right away
// (lib/revalidate.ts); heart counts catch up within an hour.
export const revalidate = 3600;

export default function Home() {
  return <FeedPage />;
}
