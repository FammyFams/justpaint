"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CommentForm } from "@/components/comment-form";
import { getAvatarClasses, getInitials, formatRelativeTime } from "@/lib/format";
import { addCommentAction } from "@/app/actions/comments";
import type { Comment } from "@/lib/types";

export function CommentList({
  initialComments,
  paintingId,
  isLoggedIn,
}: {
  initialComments: Comment[];
  paintingId: string;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
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
      {isLoggedIn ? (
        <CommentForm onSubmit={handleAdd} submitting={submitting} />
      ) : (
        <p className="text-sm text-muted-foreground">
          <Link
            href={`/login?next=/painting/${paintingId}`}
            className="text-primary hover:underline"
          >
            Log in
          </Link>{" "}
          or{" "}
          <Link href="/signup" className="text-primary hover:underline">
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
              <Link href={`/artist/${comment.authorId}`} className="shrink-0">
                <Avatar className="size-8">
                  <AvatarFallback className={getAvatarClasses(comment.authorName)}>
                    {getInitials(comment.authorName)}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <div className="min-w-0">
                <div className="flex items-baseline gap-2">
                  <Link
                    href={`/artist/${comment.authorId}`}
                    className="text-sm font-medium hover:underline"
                  >
                    {comment.authorName}
                  </Link>
                  <span className="text-xs text-muted-foreground">
                    {formatRelativeTime(comment.createdAt)}
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
