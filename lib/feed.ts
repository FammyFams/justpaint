/** Posts on the first screen of the home feed, and added by each automatic load. */
export const FEED_PAGE_SIZE = 6;
/**
 * The feed loads more on its own while scrolling until this many posts show,
 * then waits for a tap on Load more, so the footer can be reached and a
 * long scroll doesn't keep loading paintings nobody asked for.
 */
export const FEED_AUTO_LOAD_UNTIL = 18;
/** Posts added by each tap of Load more. A whole number of batches. */
export const FEED_LOAD_MORE_SIZE = 12;
/** Most posts one feed page will show. Older ones are still in the sitemap. */
export const FEED_MAX = 300;

/** How many posts to show for a ?shown= value: a whole number of batches. */
export function feedShown(raw: string | undefined): number {
  const n = Number.parseInt(raw ?? "", 10);
  if (!Number.isFinite(n) || n <= FEED_PAGE_SIZE) return FEED_PAGE_SIZE;
  return Math.min(Math.ceil(n / FEED_PAGE_SIZE) * FEED_PAGE_SIZE, FEED_MAX);
}
