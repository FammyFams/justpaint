"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { getViewerAction, type Viewer } from "@/app/actions/viewer";
import { hasSessionCookie } from "@/lib/session-cookie";

const GUEST: Viewer = { user: null, admin: false, unread: 0, heartedIds: [] };

interface ViewerContextValue {
  /**
   * False while a signed-in browser waits for its account, so nothing treats
   * it as a guest in the meantime. Guests are ready right away.
   */
  ready: boolean;
  user: Viewer["user"];
  admin: boolean;
  unread: number;
  /** Signed-in user's hearted paintings. Guests' hearts live in localStorage (like-button.tsx). */
  hearted: ReadonlySet<string>;
  /**
   * Heart counts from hearts given during this visit. Cached pages can be a
   * few minutes behind, so these win over a page's own count.
   */
  heartCounts: ReadonlyMap<string, number>;
  setHeart: (paintingId: string, hearted: boolean, count: number) => void;
  /** Asks the server again, after logging out or renaming. */
  refresh: () => void;
}

const ViewerContext = createContext<ViewerContextValue | null>(null);

export function useViewer(): ViewerContextValue {
  const value = useContext(ViewerContext);
  if (!value) throw new Error("useViewer must be used inside ViewerProvider");
  return value;
}

// The head script in app/layout.tsx sets data-session before the first
// paint, so CSS can hide "log in" from signed-in browsers until the account
// arrives. Kept in step here once the answer is known.
function markSession(on: boolean) {
  document.documentElement.toggleAttribute("data-session", on);
}

/**
 * Who's looking. Pages are cached and identical for everyone; this fills in
 * the per-visitor parts in the browser. It asks the server only when the
 * browser holds a login or admin cookie, once per page load, and again when
 * a navigation or another tab logs in or out.
 */
export function ViewerProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [viewer, setViewer] = useState<Viewer>(GUEST);
  const [ready, setReady] = useState(false);
  const [hearted, setHearted] = useState<ReadonlySet<string>>(() => new Set());
  const [heartCounts, setHeartCounts] = useState<ReadonlyMap<string, number>>(() => new Map());
  // Whether the cookies said "signed in" last time we looked; null before the first look.
  const lastCookie = useRef<boolean | null>(null);
  // Only the newest request may answer, if two overlap.
  const requestId = useRef(0);

  const load = useCallback(() => {
    const signedIn = hasSessionCookie(document.cookie);
    lastCookie.current = signedIn;
    const id = ++requestId.current;
    const settle = (next: Viewer) => {
      if (id !== requestId.current) return;
      setViewer(next);
      setHearted(new Set(next.heartedIds));
      setReady(true);
      markSession(Boolean(next.user || next.admin));
    };
    if (!signedIn) {
      settle(GUEST);
      return;
    }
    setReady(false);
    markSession(true);
    // A failed answer shows the guest view, as the server-rendered navbar did.
    getViewerAction().then(settle, () => settle(GUEST));
  }, []);

  // On arrival, and after any navigation that logged in or out (the login
  // and sign-up actions redirect, which keeps this layout mounted).
  useEffect(() => {
    if (lastCookie.current !== hasSessionCookie(document.cookie)) load();
  }, [pathname, load]);

  // Logged in or out in another tab.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      if (lastCookie.current !== hasSessionCookie(document.cookie)) load();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [load]);

  const setHeart = useCallback((paintingId: string, on: boolean, count: number) => {
    setHearted((prev) => {
      if (prev.has(paintingId) === on) return prev;
      const next = new Set(prev);
      if (on) next.add(paintingId);
      else next.delete(paintingId);
      return next;
    });
    setHeartCounts((prev) => new Map(prev).set(paintingId, count));
  }, []);

  const value = useMemo<ViewerContextValue>(
    () => ({
      ready,
      user: viewer.user,
      admin: viewer.admin,
      unread: viewer.unread,
      hearted,
      heartCounts,
      setHeart,
      refresh: load,
    }),
    [ready, viewer, hearted, heartCounts, setHeart, load]
  );

  return <ViewerContext.Provider value={value}>{children}</ViewerContext.Provider>;
}
