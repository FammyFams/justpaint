import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getArtistById,
  getCommentsForPainting,
  getPaintingAuthorName,
  getPaintingById,
  getTagsForPainting,
} from "@/lib/mock-data";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LikeButton } from "@/components/like-button";
import { CommentList } from "@/components/comment-list";
import { getAvatarClasses, getInitials, formatDate } from "@/lib/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const painting = getPaintingById(id);
  return { title: painting ? `${painting.title} — justpaint` : "justpaint" };
}

export default async function PaintingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const painting = getPaintingById(id);
  if (!painting) notFound();

  const artist = getArtistById(painting.artistId);
  const authorName = getPaintingAuthorName(painting);
  const tags = getTagsForPainting(painting);
  const comments = getCommentsForPainting(painting.id);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.3fr_1fr]">
        <div className="rounded-sm border border-border/70 bg-card p-3 shadow-[0_1px_2px_rgba(32,26,19,0.06)] sm:p-4">
          <div className="relative w-full overflow-hidden rounded-[2px] bg-muted">
            <Image
              src={painting.imagePath}
              alt={painting.title}
              width={1000}
              height={
                painting.aspect === "portrait"
                  ? 1300
                  : painting.aspect === "square"
                    ? 1000
                    : 750
              }
              sizes="(min-width: 1024px) 55vw, 92vw"
              className="h-auto w-full"
              priority
            />
          </div>
        </div>

        <div>
          <h1 className="font-heading text-3xl italic leading-tight sm:text-4xl">
            {painting.title}
          </h1>

          {artist ? (
            <Link
              href={`/artist/${artist.id}`}
              className="mt-4 flex items-center gap-2.5"
            >
              <Avatar className="size-9">
                <AvatarFallback className={getAvatarClasses(artist.displayName)}>
                  {getInitials(artist.displayName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium leading-tight">
                  {artist.displayName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(painting.createdAt)}
                </p>
              </div>
            </Link>
          ) : (
            <div className="mt-4 flex items-center gap-2.5">
              <Avatar className="size-9">
                <AvatarFallback className={getAvatarClasses(authorName)}>
                  {getInitials(authorName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium leading-tight">
                  {authorName}{" "}
                  <span className="font-normal text-muted-foreground">
                    · posted as a guest
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(painting.createdAt)}
                </p>
              </div>
            </div>
          )}

          <p className="mt-5 text-sm leading-relaxed text-foreground/90">
            {painting.description}
          </p>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <Link key={tag.id} href={`/?tag=${tag.slug}`}>
                <Badge variant="secondary" className="rounded-sm font-normal">
                  {tag.name}
                </Badge>
              </Link>
            ))}
          </div>

          <div className="mt-6">
            <LikeButton initialCount={painting.likeCount} />
          </div>

          <div className="mt-10 border-t border-border pt-6">
            <h2 className="mb-4 font-heading text-lg italic">
              Comments{comments.length > 0 ? ` (${comments.length})` : ""}
            </h2>
            <CommentList initialComments={comments} paintingId={painting.id} />
          </div>
        </div>
      </div>
    </main>
  );
}
