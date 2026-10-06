"use client";

import { useEffect, useState } from "react";
import { artistHref } from "@/lib/artist-url";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CommentForm } from "@/components/comment-form";
import { getAvatarClasses, getInitials, formatRelativeTime } from "@/lib/format";
import { addCommentAction } from "@/app/actions/comments";
import { useViewer } from "@/components/viewer";
import type { Comment } from "@/lib/types";

// The page is cached, so "2h ago" from when it was built is wrong by the
// time someone reads it. After hydration the time is worked out again; the
// key change swaps in a fresh node, since React leaves mismatched text alone.
function TimeAgo({ iso }: { iso: string }) {
  const [live, setLive] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- once, after hydration
  useEffect(() => setLive(true), []);
  return (
    <span key={live ? "live" : "built"} suppressHydrationWarning>
      {formatRelativeTime(iso)}
    </span>
  );
}

export function CommentList({
  initialComments,
  paintingId,
}: {
  initialComments: Comment[];
  paintingId: string;
}) {
  const router = useRouter();
  const { user } = useViewer();
  const comments = initialComments;
  const [submitting, setSubmitting] = useState(false);

  async function handleAdd(body: string) {
    setSubmitting(true);
    const result = await addCommentAction(paintingId, body);
    setSubmitting(false);

    if ("error" in result) {
      toast.error(result.error);
      return;
    }

    router.refresh();
  }

  return (
    <div className="flex flex-col gap-5">
      {user ? (
        <CommentForm onSubmit={handleAdd} submitting={submitting} />
      ) : (
        // Hidden from signed-in browsers until their account arrives.
        <p data-guest-only="" className="text-sm text-muted-foreground">
          <Link
            href={`/login?next=/painting/${paintingId}`}
            className="text-primary underline underline-offset-2"
          >
            Log in
          </Link>{" "}
          or{" "}
          <Link href="/signup" className="text-primary underline underline-offset-2">
            sign up
          </Link>{" "}
          to comment.
        </p>
      )}

      {comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No comments yet. Be the first to say something.
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {comments.map((comment) => (
            <li key={comment.id} className="flex gap-3">
              {/* Same place as the name link next to it, so keyboards and
                  screen readers skip it instead of meeting it twice. */}
              <Link
                href={artistHref({ id: comment.authorId, displayName: comment.authorName })}
                aria-hidden
                tabIndex={-1}
                className="shrink-0"
              >
                <Avatar className="size-8">
                  <AvatarFallback className={getAvatarClasses(comment.authorName)}>
                    {getInitials(comment.authorName)}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <div className="min-w-0">
                <div className="flex items-baseline gap-2">
                  <Link
                    href={artistHref({ id: comment.authorId, displayName: comment.authorName })}
                    className="text-sm font-medium hover:underline"
                  >
                    {comment.authorName}
                  </Link>
                  <span className="text-xs text-muted-foreground">
                    <TimeAgo iso={comment.createdAt} />
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-foreground/90">{comment.body}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
