"use client";

import { useState } from "react";
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
          Commenting isn&rsquo;t available right now.
        </p>
      )}

      {comments.length === 0 ? (
        isLoggedIn && (
          <p className="text-sm text-muted-foreground">
            No comments yet. Be the first to say something.
          </p>
        )
      ) : (
        <ul className="flex flex-col gap-4">
          {comments.map((comment) => (
            <li key={comment.id} className="flex gap-3">
              <Avatar className="size-8 shrink-0">
                <AvatarFallback className={getAvatarClasses(comment.authorName)}>
                  {getInitials(comment.authorName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-medium">{comment.authorName}</span>
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
