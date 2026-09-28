/** Posts on the first screen of the home feed, and added by each Load more. */
export const FEED_PAGE_SIZE = 6;
/** Most posts one feed page will show. Older ones are still in the sitemap. */
export const FEED_MAX = 300;

/** How many posts to show for a ?shown= value: a whole number of batches. */
export function feedShown(raw: string | undefined): number {
  const n = Number.parseInt(raw ?? "", 10);
  if (!Number.isFinite(n) || n <= FEED_PAGE_SIZE) return FEED_PAGE_SIZE;
  return Math.min(Math.ceil(n / FEED_PAGE_SIZE) * FEED_PAGE_SIZE, FEED_MAX);
}
