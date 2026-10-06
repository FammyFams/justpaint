"use server";

import { getFeed } from "@/lib/paintings";
import { SERVER_BUSY } from "@/lib/busy";
import { feedShown } from "@/lib/feed";
import type { Painting } from "@/lib/types";

/**
 * The first `shown` posts of the home feed, for Load more without changing
 * the page address. Signed-in hearts come with the account
 * (components/viewer.tsx), so this is the same for everyone.
 */
export async function loadFeedAction(input: {
  tag?: string;
  octoberChallenge?: boolean;
  shown: number;
}): Promise<{ error: string } | { paintings: Painting[]; hasMore: boolean }> {
  const tag = typeof input.tag === "string" ? input.tag.slice(0, 100) : undefined;
  const limit = feedShown(String(input.shown));

  try {
    return await getFeed({ tag, octoberChallenge: input.octoberChallenge === true, limit });
  } catch (error) {
    console.error("loadFeedAction failed", error);
    return { error: SERVER_BUSY };
  }
}
