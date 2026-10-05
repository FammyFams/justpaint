"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
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
  /** The posts themselves, so Back can show them without asking the server. */
  paintings?: Painting[];
  heartedIds?: string[];
  hasMore?: boolean;
}

// False until a feed has mounted once. The first render while hydrating has
// to match the server's HTML, so saved posts are only used on later mounts;
// Back from a painting is one of those (a client-side navigation).
let hydrated = false;

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
  const filter = `${tag ?? ""}|${octoberChallenge}`;
  // Back from a painting: start with the posts the visitor had, so the first
  // frame is already the full feed instead of 6 posts and then a jump.
  const [restored] = useState(() => {
    const saved = hydrated ? readSaved(filter) : null;
    return saved?.paintings ? { ...saved, paintings: saved.paintings } : null;
  });
  const [paintings, setPaintings] = useState(restored?.paintings ?? initialPaintings);
  const [heartedIds, setHeartedIds] = useState(
    restored ? restored.heartedIds : initialHeartedIds
  );
  const [hasMore, setHasMore] = useState(restored?.hasMore ?? initialHasMore);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const moreRef = useRef<HTMLAnchorElement>(null);
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

  // Hearts may have changed while the visitor was away, often on the painting
  // they just opened. Update the counts on the posts already showing without
  // adding newer posts, so nothing on screen moves.
  async function refreshHearts(count: number) {
    try {
      const result = await loadFeedAction({ tag, octoberChallenge, shown: count });
      if ("error" in result) return;
      const counts = new Map(result.paintings.map((p) => [p.id, p.likeCount]));
      setPaintings((prev) => prev.map((p) => ({ ...p, likeCount: counts.get(p.id) ?? p.likeCount })));
      const freshHearted = result.heartedIds;
      if (freshHearted) {
        setHeartedIds((prev) => [...(prev ?? []).filter((id) => !counts.has(id)), ...freshHearted]);
      }
    } catch {
      // Keep the saved counts.
    }
  }

  // Back with saved posts: jump to the saved spot before the first paint.
  useLayoutEffect(() => {
    hydrated = true;
    if (!restored) return;
    window.scrollTo(0, restored.scrollY);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- counts update once the server answers, not during this effect
    refreshHearts(restored.paintings.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once on arrival
  }, []);

  // Coming back without saved posts (a reload, or a spot saved before posts
  // were kept): reload as many posts as before, then return to the same
  // scroll spot.
  useEffect(() => {
    if (restored) return;
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
    const save = () =>
      writeSaved({
        filter,
        shown: paintings.length,
        scrollY: window.scrollY,
        paintings,
        heartedIds,
        hasMore,
      });
    const onVisibility = () => {
      if (document.visibilityState === "hidden") save();
    };
    document.addEventListener("click", save, true);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("click", save, true);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [filter, paintings, heartedIds, hasMore]);

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
