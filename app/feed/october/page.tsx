import { FeedPage, feedMetadata } from "@/components/feed-page";

export const metadata = feedMetadata;

// The home feed's October tab. Visitors see it at /?challenge=october
// (next.config.ts rewrites); cached like the home page.
export const revalidate = 600;

export default function OctoberFeed() {
  return <FeedPage challenge />;
}
