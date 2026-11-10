import { FeedPage, feedMetadata } from "@/components/feed-page";
import { OCTOBER } from "@/lib/challenges";

export const metadata = feedMetadata;

// October's tab of the home feed, at /?challenge=october. Its own route
// because app/feed/[challenge] has one cache setting for every month, and a
// finished month doesn't need hourly rebuilds. Entries added or removed still
// show right away (lib/revalidate.ts).
export const revalidate = 2592000;

export default function OctoberFeed() {
  return <FeedPage challenge={OCTOBER.slug} />;
}
