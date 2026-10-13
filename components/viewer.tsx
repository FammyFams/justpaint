"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { getViewerAction, type Viewer } from "@/app/actions/viewer";
import { hasLoginCookie, hasSessionCookie } from "@/lib/session-cookie";

const GUEST: Viewer = { user: null, admin: false, unread: 0, heartedIds: [], loggedOut: false };

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
   * Heart counts from hearts given during this visit. Cached pages can be up
   * to an hour behind, so these win over a page's own count.
   */
  heartCounts: ReadonlyMap<string, number>;
  setHeart: (paintingId: string, hearted: boolean, count: number) => void;
  /** Asks the server again, after logging out or renaming. */
  refresh: () => void;
  /** Call just before logging out on purpose, so it isn't taken for a login that ended. */
  expectLogout: () => void;
  /** A server answer said the login is over: says so and shows the logged-out view. */
  loginEnded: () => void;
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

// Which cookies the browser holds. The login cookie is tracked on its own,
// since the admin flag alone also counts as "ask the server".
function cookieState(): string {
  return `${hasLoginCookie(document.cookie)}:${hasSessionCookie(document.cookie)}`;
}

/**
 * Who's looking. Pages are cached and identical for everyone; this fills in
 * the per-visitor parts in the browser. It asks the server only when the
 * browser holds a login or admin cookie, once per page load, and again when
 * a navigation or another tab logs in or out.
 */
export function ViewerProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [viewer, setViewer] = useState<Viewer>(GUEST);
  const [ready, setReady] = useState(false);
  const [hearted, setHearted] = useState<ReadonlySet<string>>(() => new Set());
  const [heartCounts, setHeartCounts] = useState<ReadonlyMap<string, number>>(() => new Map());
  // cookieState() last time we looked; null before the first look.
  const lastCookie = useRef<string | null>(null);
  // Only the newest request may answer, if two overlap.
  const requestId = useRef(0);
  // The account shown right now, and until when a logout is on purpose.
  const userRef = useRef<Viewer["user"]>(null);
  const leavingUntil = useRef(0);

  // Sessions refresh inside server calls (proxy.ts). If Supabase turns one
  // down, the server deletes the login cookie and this says so, once.
  const sayLoggedOut = useCallback(() => {
    toast("You were logged out.", {
      id: "logged-out",
      description: "Log in again to post, heart and comment as you.",
      duration: 15000,
      action: {
        label: "Log in",
        onClick: () => router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`),
      },
    });
  }, [router]);

  const load = useCallback(() => {
    // Showing an account a moment ago, no logout on purpose, and the login
    // cookie is gone: a server answer ended the login.
    if (userRef.current && Date.now() > leavingUntil.current && !hasLoginCookie(document.cookie)) {
      sayLoggedOut();
    }
    const signedIn = hasSessionCookie(document.cookie);
    lastCookie.current = cookieState();
    const id = ++requestId.current;
    const settle = (next: Viewer) => {
      if (id !== requestId.current) return;
      userRef.current = next.user;
      // The answer may have deleted the cookies of a login that ended.
      lastCookie.current = cookieState();
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
    getViewerAction().then(
      (next) => {
        if (next.loggedOut) sayLoggedOut();
        settle(next);
      },
      () => settle(GUEST)
    );
  }, [sayLoggedOut]);

  // On arrival, and after any navigation that logged in or out (the login
  // and sign-up actions redirect, which keeps this layout mounted).
  useEffect(() => {
    if (lastCookie.current !== cookieState()) load();
  }, [pathname, load]);

  // Logged in or out in another tab, or a server answer ended the login.
  // Browsers with cookieStore say so the moment a cookie changes; the rest
  // notice on the next page or when the tab comes back.
  useEffect(() => {
    const check = () => {
      if (lastCookie.current !== cookieState()) load();
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") check();
    };
    const cookieStore = (window as { cookieStore?: EventTarget }).cookieStore;
    document.addEventListener("visibilitychange", onVisible);
    cookieStore?.addEventListener("change", check);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      cookieStore?.removeEventListener("change", check);
    };
  }, [load]);

  const expectLogout = useCallback(() => {
    leavingUntil.current = Date.now() + 30_000;
  }, []);

  const loginEnded = useCallback(() => {
    sayLoggedOut();
    load();
  }, [sayLoggedOut, load]);

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
      expectLogout,
      loginEnded,
    }),
    [ready, viewer, hearted, heartCounts, setHeart, load, expectLogout, loginEnded]
  );

  return <ViewerContext.Provider value={value}>{children}</ViewerContext.Provider>;
}
