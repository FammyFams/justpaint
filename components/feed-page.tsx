import type { Metadata } from "next";
import Link from "next/link";
import { getAllTags, getFeed } from "@/lib/paintings";
import { HomeFeed } from "@/components/home-feed";
import { FEED_FIRST } from "@/lib/feed";
import { FeedFilter } from "@/components/feed-filter";
import { getSiteUrl } from "@/lib/site-url";
import { SITE_DESCRIPTION } from "@/lib/seo";
import { CHALLENGE_NAME } from "@/lib/october-challenge";
import { TodayMark } from "@/components/today-mark";

// Every version of the home feed (/, /?challenge=october, /?tag=, /?shown=)
// is the same page to search engines.
export const feedMetadata: Metadata = {
  title: "justpaint | A Painting Community for Beginners",
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
};

// Names the site for search engines, so results can show "justpaint".
const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "justpaint",
  alternateName: "just paint",
  url: getSiteUrl(),
  description: SITE_DESCRIPTION,
};

/**
 * The home feed. app/page.tsx (all posts) and app/feed/october (the October
 * tab) are cached; app/feed builds the ?tag= and ?shown= versions per
 * request. next.config.ts sends each address to the right one.
 */
export async function FeedPage({
  tag,
  challenge = false,
  shown = FEED_FIRST,
}: {
  tag?: string;
  challenge?: boolean;
  shown?: number;
}) {
  const [{ paintings, hasMore, total }, tags] = await Promise.all([
    getFeed({ tag, octoberChallenge: challenge, limit: shown, withCount: Boolean(tag) }),
    getAllTags(),
  ]);
  const activeTag = tag ? tags.find((t) => t.slug === tag) : undefined;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd).replace(/</g, "\\u003c") }}
      />
      <div className="mb-8 max-w-2xl sm:mb-10">
        <h1 className="font-heading text-4xl italic leading-none tracking-tight sm:text-5xl">
          JUST PAINT
        </h1>
        <p className="mt-3 text-muted-foreground">
          what did you paint <TodayMark />?
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          a painting community for beginners.
        </p>
        <Link
          href="/october-challenge"
          className="mt-3 inline-block text-sm font-medium text-primary underline underline-offset-2 hover:decoration-2"
        >
          {CHALLENGE_NAME}: rules and prompts &rarr;
        </Link>
      </div>

      <div className="mb-6">
        <FeedFilter challenge={challenge} tag={tag} />
      </div>

      {activeTag && (
        <p className="mb-5 text-sm text-muted-foreground">
          Showing <span className="text-foreground">{activeTag.name}</span>:{" "}
          {total} {total === 1 ? "piece" : "pieces"}
        </p>
      )}

      <HomeFeed
        // Start over when the filter changes.
        key={`${tag ?? ""}|${challenge}`}
        initialPaintings={paintings}
        initialHasMore={hasMore}
        tag={tag}
        octoberChallenge={challenge}
        emptyHint={
          challenge
            ? `No ${CHALLENGE_NAME} entries yet. Post one and be the first.`
            : undefined
        }
      />
    </main>
  );
}
