"use client";

import { useEffect, useRef, useState } from "react";
import { PaintingGrid } from "@/components/painting-grid";
import { loadFeedAction } from "@/app/actions/feed";
import {
  FEED_AUTO_LOAD_UNTIL,
  FEED_LOAD_MORE_SIZE,
  FEED_MAX,
  FEED_PAGE_SIZE,
} from "@/lib/feed";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Painting } from "@/lib/types";

// Saved on this page's own history entry, so Back from a painting brings
// the same posts and scroll spot, while a fresh visit starts at the top.
const STATE_KEY = "jpFeed";
interface SavedFeed {
  filter: string;
  shown: number;
  scrollY: number;
}

function readSaved(filter: string): SavedFeed | null {
  const saved = (window.history.state as Record<string, unknown> | null)?.[STATE_KEY] as
    | SavedFeed
    | undefined;
  return saved && saved.filter === filter ? saved : null;
}

function writeSaved(saved: SavedFeed) {
  try {
    window.history.replaceState({ ...window.history.state, [STATE_KEY]: saved }, "");
  } catch {
    // Some browsers limit how often this can be called; losing it only
    // means Back starts at the top.
  }
}

// The home feed shows the first posts and loads more as the visitor scrolls
// (up to FEED_AUTO_LOAD_UNTIL, then on a tap), without changing the address.
// The Load more link still points at /?shown=N, so search engines can follow
// it to every post.
export function HomeFeed({
  initialPaintings,
  initialHeartedIds,
  initialHasMore,
  tag,
  octoberChallenge,
  emptyHint,
}: {
  initialPaintings: Painting[];
  initialHeartedIds?: string[];
  initialHasMore: boolean;
  tag?: string;
  octoberChallenge: boolean;
  emptyHint?: string;
}) {
  const [paintings, setPaintings] = useState(initialPaintings);
  const [heartedIds, setHeartedIds] = useState(initialHeartedIds);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const moreRef = useRef<HTMLAnchorElement>(null);
  const filter = `${tag ?? ""}|${octoberChallenge}`;
  const shown = paintings.length;

  const params = new URLSearchParams();
  if (tag) params.set("tag", tag);
  if (octoberChallenge) params.set("challenge", "october");
  params.set("shown", String(shown + FEED_LOAD_MORE_SIZE));
  const moreHref = `/?${params}`;

  async function load(count: number) {
    setLoading(true);
    setFailed(false);
    try {
      const result = await loadFeedAction({ tag, octoberChallenge, shown: count });
      if ("error" in result) {
        setFailed(true);
        return false;
      }
      setPaintings(result.paintings);
      setHeartedIds(result.heartedIds);
      setHasMore(result.hasMore);
      return true;
    } catch {
      setFailed(true);
      return false;
    } finally {
      setLoading(false);
    }
  }

  // Coming back to this page: reload as many posts as before, then return
  // to the same scroll spot.
  useEffect(() => {
    const saved = readSaved(filter);
    if (!saved || saved.shown <= initialPaintings.length) return;
    // Deferred a tick: the saved spot lives in the browser's history, which
    // the server render can't know about.
    Promise.resolve()
      .then(() => load(saved.shown))
      .then((ok) => {
        if (ok) requestAnimationFrame(() => window.scrollTo(0, saved.scrollY));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once on arrival
  }, []);

  // Remember how far down the visitor is, right before they leave the page
  // (opening a painting, switching tabs, closing).
  useEffect(() => {
    const save = () => writeSaved({ filter, shown: paintings.length, scrollY: window.scrollY });
    const onVisibility = () => {
      if (document.visibilityState === "hidden") save();
    };
    document.addEventListener("click", save, true);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("click", save, true);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [filter, paintings.length]);

  // Load the next batch when the Load more link comes near the screen, until
  // FEED_AUTO_LOAD_UNTIL posts show; after that the link waits for a tap.
  useEffect(() => {
    const el = moreRef.current;
    if (!el || !hasMore || loading || failed || shown >= FEED_AUTO_LOAD_UNTIL) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          observer.disconnect();
          load(shown + FEED_PAGE_SIZE);
        }
      },
      { rootMargin: "800px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load reads the latest props
  }, [hasMore, loading, failed, shown]);

  return (
    <>
      <PaintingGrid
        paintings={paintings}
        heartedIds={heartedIds}
        emptyHint={emptyHint}
        groupByOctoberDay={octoberChallenge}
      />
      {hasMore && shown < FEED_MAX && (
        <div className="mt-10 flex flex-col items-center gap-2">
          <a
            ref={moreRef}
            href={moreHref}
            onClick={(e) => {
              e.preventDefault();
              if (!loading) load(shown + FEED_LOAD_MORE_SIZE);
            }}
            aria-disabled={loading}
            className={cn(buttonVariants({ variant: "outline" }), "min-w-36")}
          >
            {loading ? "Loading…" : failed ? "Try again" : "Load more"}
          </a>
          {failed && (
            <p className="text-sm text-muted-foreground">Couldn&rsquo;t load more posts.</p>
          )}
        </div>
      )}
    </>
  );
}
