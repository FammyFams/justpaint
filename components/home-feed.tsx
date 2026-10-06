"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { PaintingGrid } from "@/components/painting-grid";
import { loadFeedAction } from "@/app/actions/feed";
import { FEED_LOAD_MORE_SIZE, FEED_MAX } from "@/lib/feed";
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

// The home feed shows the first posts (FEED_FIRST, with the cached page)
// and adds more on a tap, without changing the address. The Load more link
// still points at /?shown=N, so search engines can follow it to every post.
// Heart counts on screen are kept current by the hearts themselves
// (components/viewer.tsx), not by asking the server again.
export function HomeFeed({
  initialPaintings,
  initialHasMore,
  tag,
  octoberChallenge,
  emptyHint,
}: {
  initialPaintings: Painting[];
  initialHasMore: boolean;
  tag?: string;
  octoberChallenge: boolean;
  emptyHint?: string;
}) {
  const filter = `${tag ?? ""}|${octoberChallenge}`;
  // Back from a painting: start with the posts the visitor had, so the first
  // frame is already the full feed instead of the first posts and then a jump.
  const [restored] = useState(() => {
    const saved = hydrated ? readSaved(filter) : null;
    return saved?.paintings ? { ...saved, paintings: saved.paintings } : null;
  });
  const [paintings, setPaintings] = useState(restored?.paintings ?? initialPaintings);
  const [hasMore, setHasMore] = useState(restored?.hasMore ?? initialHasMore);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  // Where to scroll once the posts from a load are on the page.
  const scrollAfterLoad = useRef<number | null>(null);
  const shown = paintings.length;

  const params = new URLSearchParams();
  if (tag) params.set("tag", tag);
  if (octoberChallenge) params.set("challenge", "october");
  params.set("shown", String(shown + FEED_LOAD_MORE_SIZE));
  const moreHref = `/?${params}`;

  async function load(count: number, scrollTo?: number) {
    setLoading(true);
    setFailed(false);
    try {
      const result = await loadFeedAction({ tag, octoberChallenge, shown: count });
      if ("error" in result) {
        setFailed(true);
        return false;
      }
      scrollAfterLoad.current = scrollTo ?? null;
      setPaintings(result.paintings);
      setHasMore(result.hasMore);
      return true;
    } catch {
      setFailed(true);
      return false;
    } finally {
      setLoading(false);
    }
  }

  // Back with saved posts: jump to the saved spot before the first paint.
  useLayoutEffect(() => {
    hydrated = true;
    if (restored) window.scrollTo(0, restored.scrollY);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once on arrival
  }, []);

  // Coming back without saved posts (a reload, or a spot saved before posts
  // were kept) after loading more: load as many posts as before, then
  // return to the same scroll spot.
  useEffect(() => {
    if (restored) return;
    const saved = readSaved(filter);
    if (!saved || saved.shown <= initialPaintings.length) return;
    // Deferred a tick: the saved spot lives in the browser's history, which
    // the server render can't know about.
    Promise.resolve().then(() => load(saved.shown, saved.scrollY));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once on arrival
  }, []);

  // Scroll once the loaded posts are on the page, before it's painted.
  useLayoutEffect(() => {
    if (scrollAfterLoad.current === null) return;
    window.scrollTo(0, scrollAfterLoad.current);
    scrollAfterLoad.current = null;
  }, [paintings]);

  // Remember how far down the visitor is, right before they leave the page
  // (opening a painting, switching tabs, closing).
  useEffect(() => {
    const save = () =>
      writeSaved({
        filter,
        shown: paintings.length,
        scrollY: window.scrollY,
        paintings,
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
  }, [filter, paintings, hasMore]);

  return (
    <>
      <PaintingGrid
        paintings={paintings}
        emptyHint={emptyHint}
        groupByOctoberDay={octoberChallenge}
      />
      {hasMore && shown < FEED_MAX && (
        <div className="mt-10 flex flex-col items-center gap-2">
          <a
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
          {/* Always rendered, so screen readers announce the text when it appears. */}
          <p role="status" className="text-sm text-muted-foreground">
            {failed ? "Couldn’t load more posts." : ""}
          </p>
        </div>
      )}
    </>
  );
}
