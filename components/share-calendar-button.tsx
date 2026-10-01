"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Download, Share2 } from "lucide-react";
import { sendGAEvent } from "@next/third-parties/google";
import { CHALLENGE_NAME, HASHTAG } from "@/lib/october-challenge";

const IMAGE = "/october-challenge/calendar.png";
const TEXT = `${CHALLENGE_NAME}: one prompt a day. Paint along on justpaint! ${HASHTAG}`;

// Opens the phone's share sheet with the calendar picture and the page link.
// Browsers that can't share files share just the link, and browsers with no
// share sheet (most desktops) copy the link instead.
export function ShareCalendarButton({ className }: { className?: string }) {
  const [busy, setBusy] = useState(false);
  const file = useRef<File | null>(null);

  // Fetch the picture ahead of time: iPhone Safari refuses to open the share
  // sheet if the tap was followed by a slow download first.
  useEffect(() => {
    if (!navigator.share) return;
    fetch(IMAGE)
      .then((r) => r.blob())
      .then((blob) => {
        file.current = new File([blob], "justpaint-october-challenge.png", { type: "image/png" });
      })
      .catch(() => {});
  }, []);

  async function share() {
    // Counted in Google Analytics: every tap, then each finished share by how
    // it went out (picture, link, or copied link).
    sendGAEvent("event", "calendar_share_tap");
    const url = `${window.location.origin}/october-challenge`;
    setBusy(true);
    try {
      if (navigator.share) {
        const picture = file.current;
        if (picture && navigator.canShare?.({ files: [picture] })) {
          await navigator.share({ files: [picture], text: `${TEXT} ${url}` });
          sendGAEvent("event", "calendar_share", { method: "picture" });
        } else {
          await navigator.share({ title: CHALLENGE_NAME, text: TEXT, url });
          sendGAEvent("event", "calendar_share", { method: "link" });
        }
        return;
      }
      await navigator.clipboard.writeText(url);
      sendGAEvent("event", "calendar_share", { method: "copy" });
      toast.success("Link copied. Paste it anywhere to share the challenge.");
    } catch (error) {
      // Closing the share sheet isn't an error worth showing.
      if (error instanceof DOMException && error.name === "AbortError") return;
      toast.error("Couldn't share right now. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button type="button" onClick={share} disabled={busy} className={className}>
      <Share2 /> Share this calendar
    </button>
  );
}

export function DownloadCalendarButton({ className }: { className?: string }) {
  return (
    <a
      href={IMAGE}
      download="justpaint-october-challenge.png"
      onClick={() => sendGAEvent("event", "calendar_download")}
      className={className}
    >
      <Download /> Download
    </a>
  );
}
