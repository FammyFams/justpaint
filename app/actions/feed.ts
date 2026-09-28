"use server";

import { getFeed } from "@/lib/paintings";
import { getSessionUserId } from "@/lib/current-user";
import { getHeartedIds } from "@/lib/hearts";
import { SERVER_BUSY } from "@/lib/busy";
import { feedShown } from "@/lib/feed";
import type { Painting } from "@/lib/types";

/**
 * The first `shown` posts of the home feed, for loading more as the visitor
 * scrolls without changing the page address.
 */
export async function loadFeedAction(input: {
  tag?: string;
  octoberChallenge?: boolean;
  shown: number;
}): Promise<
  { error: string } | { paintings: Painting[]; heartedIds?: string[]; hasMore: boolean }
> {
  const tag = typeof input.tag === "string" ? input.tag.slice(0, 100) : undefined;
  const limit = feedShown(String(input.shown));

  try {
    const [{ paintings, hasMore }, userId] = await Promise.all([
      getFeed({ tag, octoberChallenge: input.octoberChallenge === true, limit }),
      getSessionUserId(),
    ]);
    const heartedIds = userId
      ? await getHeartedIds(userId, paintings.map((p) => p.id))
      : undefined;
    return { paintings, heartedIds, hasMore };
  } catch (error) {
    console.error("loadFeedAction failed", error);
    return { error: SERVER_BUSY };
  }
}
