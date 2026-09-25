"use client";

import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CommentForm } from "@/components/comment-form";
import { getArtistById } from "@/lib/mock-data";
import { getAvatarClasses, getInitials, formatRelativeTime } from "@/lib/format";
import type { Comment } from "@/lib/types";

let nextId = 1000;

export function CommentList({
  initialComments,
  paintingId,
}: {
  initialComments: Comment[];
  paintingId: string;
}) {
  const [comments, setComments] = useState(initialComments);

  function handleAdd(body: string) {
    const comment: Comment = {
      id: `local-${nextId++}`,
      paintingId,
      artistId: "you",
      body,
      createdAt: new Date().toISOString(),
    };
    setComments((prev) => [...prev, comment]);
  }

  return (
    <div className="flex flex-col gap-5">
      <CommentForm onSubmit={handleAdd} />

      {comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No comments yet — be the first to say something.
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {comments.map((comment) => {
            const author = getArtistById(comment.artistId);
            const name = author?.displayName ?? "You";
            return (
              <li key={comment.id} className="flex gap-3">
                <Avatar className="size-8 shrink-0">
                  <AvatarFallback className={getAvatarClasses(name)}>
                    {getInitials(name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-medium">{name}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeTime(comment.createdAt)}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-foreground/90">
                    {comment.body}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
