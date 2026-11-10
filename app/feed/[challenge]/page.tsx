import { notFound } from "next/navigation";
import { FeedPage, feedMetadata } from "@/components/feed-page";
import { CHALLENGES, OCTOBER, challengeBySlug } from "@/lib/challenges";

export const metadata = feedMetadata;

// A challenge's tab of the home feed. Visitors see it at /?challenge=november
// (next.config.ts rewrites); cached like the home page. A finished month
// moves to its own folder with a longer cache (app/feed/october).
export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return CHALLENGES.filter((c) => c !== OCTOBER).map((c) => ({ challenge: c.slug }));
}

export default async function ChallengeFeed({
  params,
}: {
  params: Promise<{ challenge: string }>;
}) {
  const challenge = challengeBySlug((await params).challenge);
  if (!challenge) notFound();
  return <FeedPage challenge={challenge.slug} />;
}
