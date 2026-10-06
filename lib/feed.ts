/** Feed lengths are whole numbers of these (?shown= rounds up to one). */
export const FEED_PAGE_SIZE = 6;
/**
 * Posts on the first screen of the home feed. They come with the cached
 * page, instead of 6 and then two more batches loaded while scrolling (each
 * batch was a server call, one per visit). Then the feed waits for a tap on
 * Load more, so the footer can be reached.
 */
export const FEED_FIRST = 18;
/** Posts added by each tap of Load more. A whole number of batches. */
export const FEED_LOAD_MORE_SIZE = 12;
/** Most posts one feed page will show. Older ones are still in the sitemap. */
export const FEED_MAX = 300;

/** How many posts to show for a ?shown= value: a whole number of batches. */
export function feedShown(raw: string | undefined): number {
  const n = Number.parseInt(raw ?? "", 10);
  if (!Number.isFinite(n) || n <= FEED_FIRST) return FEED_FIRST;
  return Math.min(Math.ceil(n / FEED_PAGE_SIZE) * FEED_PAGE_SIZE, FEED_MAX);
}
