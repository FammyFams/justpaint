"use client";

import { useEffect } from "react";
import { toast } from "sonner";

// The upload form leaves the new painting's id here just before it opens
// the painting's page. Session storage, so a reload or a later visit
// doesn't show it again.
export const POSTED_KEY = "justpaint:posted";

/** Pops up "Posted successfully." once, on the painting that was just posted. */
export function PostedToast({ paintingId }: { paintingId: string }) {
  useEffect(() => {
    try {
      if (sessionStorage.getItem(POSTED_KEY) !== paintingId) return;
      sessionStorage.removeItem(POSTED_KEY);
    } catch {
      return;
    }
    toast.success("Posted successfully.", { id: "posted" });
  }, [paintingId]);

  return null;
}
