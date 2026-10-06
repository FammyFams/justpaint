import { FeedPage, feedMetadata } from "@/components/feed-page";

export const metadata = feedMetadata;

// Cached and the same for everyone. New and removed posts show right away
// (lib/revalidate.ts); heart counts catch up within 10 minutes.
export const revalidate = 600;

export default function Home() {
  return <FeedPage />;
}
