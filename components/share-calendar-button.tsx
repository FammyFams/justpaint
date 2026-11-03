"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Download, Share2 } from "lucide-react";
import { sendGAEvent } from "@next/third-parties/google";
import { CURRENT_CHALLENGE, challengeBySlug, challengePath } from "@/lib/challenges";

// A challenge page's address, its calendar picture, and the words that go
// with a share.
function shareDetails(slug: string) {
  const challenge = challengeBySlug(slug) ?? CURRENT_CHALLENGE;
  const path = challengePath(challenge);
  return {
    name: challenge.name,
    path,
    image: `${path}/calendar.png`,
    fileName: `justpaint-${challenge.slug}-challenge.png`,
    text: `${challenge.name}: one prompt a day. Paint along on justpaint! ${challenge.hashtag}`,
  };
}

// Opens the phone's share sheet with the calendar picture and the page link.
// Browsers that can't share files share just the link, and browsers with no
// share sheet (most desktops) copy the link instead.
export function ShareCalendarButton({ slug, className }: { slug: string; className?: string }) {
  const { name, path, image, fileName, text } = shareDetails(slug);
  const [busy, setBusy] = useState(false);
  const file = useRef<File | null>(null);

  // Fetch the picture ahead of time: iPhone Safari refuses to open the share
  // sheet if the tap was followed by a slow download first.
  useEffect(() => {
    if (!navigator.share) return;
    fetch(image)
      .then((r) => r.blob())
      .then((blob) => {
        file.current = new File([blob], fileName, { type: "image/png" });
      })
      .catch(() => {});
  }, [image, fileName]);

  async function share() {
    // Counted in Google Analytics: every tap, then each finished share by how
    // it went out (picture, link, or copied link), with which month it was.
    sendGAEvent("event", "calendar_share_tap", { challenge: slug });
    const url = `${window.location.origin}${path}`;
    setBusy(true);
    try {
      if (navigator.share) {
        const picture = file.current;
        if (picture && navigator.canShare?.({ files: [picture] })) {
          await navigator.share({ files: [picture], text: `${text} ${url}` });
          sendGAEvent("event", "calendar_share", { method: "picture", challenge: slug });
        } else {
          await navigator.share({ title: name, text, url });
          sendGAEvent("event", "calendar_share", { method: "link", challenge: slug });
        }
        return;
      }
      await navigator.clipboard.writeText(url);
      sendGAEvent("event", "calendar_share", { method: "copy", challenge: slug });
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

export function DownloadCalendarButton({ slug, className }: { slug: string; className?: string }) {
  const { image, fileName } = shareDetails(slug);
  return (
    <a
      href={image}
      download={fileName}
      onClick={() => sendGAEvent("event", "calendar_download", { challenge: slug })}
      className={className}
    >
      <Download /> Download
    </a>
  );
}
