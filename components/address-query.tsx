"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useViewer } from "@/components/viewer";
import { safeNext } from "@/lib/safe-next";

// Read from the address in the browser, so the pages around these can be
// cached and the same for everyone.

/** A ?next= path on this site, or "/". */
export function nextFromAddress(): string {
  return safeNext(new URLSearchParams(window.location.search).get("next"));
}

/** A status line shown when the address has ?param= (e.g. ?confirmed=1). */
export function QueryNotice({ param, children }: { param: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the address is only known in the browser
    setShow(new URLSearchParams(window.location.search).has(param));
  }, [param]);
  if (!show) return null;
  return (
    <p className="mt-4 rounded-sm bg-secondary px-3 py-2 text-center text-sm" role="status">
      {children}
    </p>
  );
}

/** Sends a signed-in visitor on (to ?next=, or `to`) instead of showing a login form. */
export function RedirectIfSignedIn({ to }: { to?: string }) {
  const { user } = useViewer();
  const router = useRouter();
  useEffect(() => {
    if (user) router.replace(to ?? nextFromAddress());
  }, [user, to, router]);
  return null;
}

/**
 * Puts the right address in the address bar without reloading, when a page
 * was opened at another spelling of it (an old /artist/<id> link, other
 * capitalization). The page's canonical link says the same for search
 * engines. Not redirect(): a cached page stores that as a 307 with no
 * Location header.
 */
export function CanonicalAddress({ href }: { href: string }) {
  useEffect(() => {
    if (window.location.pathname !== href) {
      window.history.replaceState(window.history.state, "", href + window.location.search + window.location.hash);
    }
  }, [href]);
  return null;
}
