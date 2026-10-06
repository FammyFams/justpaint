import "server-only";
import { revalidatePath } from "next/cache";

/**
 * Cached pages that list posts. They rebuild on their own every 10 minutes
 * (heart counts), and right away through this when a post is added,
 * removed or moved in or out of the challenge. /feed/october is the October
 * tab of the home feed (/?challenge=october, see next.config.ts rewrites).
 */
export function revalidateFeeds() {
  revalidatePath("/");
  revalidatePath("/feed/october");
  revalidatePath("/october-challenge");
}
