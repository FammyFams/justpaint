"use client";

import { useEffect, useRef, useState } from "react";
import { artistHref } from "@/lib/artist-url";
import Link from "next/link";
import { adminLatestCommentsAction } from "@/app/actions/admin";
import type { AdminComment } from "@/lib/admin-comments";
import { formatDateTime } from "@/lib/format";

const POLL_MS = 10_000;

// Checks for new comments every 10 seconds while the tab is open and in
// view. New ones slide in at the top with a highlight.
export function AdminCommentFeed({ initialComments }: { initialComments: AdminComment[] }) {
  const [comments, setComments] = useState(initialComments);
  const [fresh, setFresh] = useState<Set<string>>(new Set());
  const [failed, setFailed] = useState(false);
  const known = useRef(new Set(initialComments.map((c) => c.id)));

  useEffect(() => {
    let stopped = false;

    async function poll() {
      if (document.visibilityState !== "visible") return;
      try {
        const result = await adminLatestCommentsAction();
        if (stopped) return;
        if ("error" in result) {
          setFailed(true);
          return;
        }
        setFailed(false);
        const added = result.comments.filter((c) => !known.current.has(c.id)).map((c) => c.id);
        added.forEach((id) => known.current.add(id));
        if (added.length > 0) setFresh((prev) => new Set([...prev, ...added]));
        setComments(result.comments);
      } catch {
        if (!stopped) setFailed(true);
      }
    }

    const timer = setInterval(poll, POLL_MS);
    // Catch up right away when coming back to the tab.
    const onVisible = () => {
      if (document.visibilityState === "visible") poll();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      stopped = true;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return (
    <>
      <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
        <span
          className={`size-2 rounded-full ${failed ? "bg-destructive" : "animate-pulse bg-green-600"}`}
          aria-hidden
        />
        {failed ? "Can't reach the server. Still trying." : "Live: checks every 10 seconds."}
      </p>

      {comments.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">No comments yet.</p>
      ) : (
        <ul className="mt-4 max-h-[32rem] divide-y divide-border overflow-y-auto rounded-sm border border-border">
          {comments.map((c) => (
            <li
              key={c.id}
              className={`p-3 text-sm transition-colors duration-1000 ${fresh.has(c.id) ? "bg-primary/10" : ""}`}
            >
              <p className="text-muted-foreground">
                <Link href={artistHref({ id: c.authorId, displayName: c.authorName })} className="font-medium text-foreground hover:underline">
                  {c.authorName}
                </Link>{" "}
                on{" "}
                <Link href={`/painting/${c.paintingId}`} prefetch={false} className="hover:underline">
                  {c.paintingTitle}
                </Link>{" "}
                · {formatDateTime(c.createdAt)}
              </p>
              <p className="mt-1 whitespace-pre-line break-words">{c.body}</p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
