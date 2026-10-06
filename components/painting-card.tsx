import Link from "next/link";
import { PaintingImage } from "@/components/painting-image";
import type { Painting } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { LikeButton } from "@/components/like-button";

const aspectRatio: Record<Painting["aspect"], string> = {
  portrait: "aspect-[3/4]",
  landscape: "aspect-[4/3]",
  square: "aspect-square",
};

export function PaintingCard({
  painting,
  index = 0,
  hearted,
  titleAs: Title = "h2",
}: {
  painting: Painting;
  index?: number;
  /** Signed-in user's heart state; undefined for guests. */
  hearted?: boolean;
  /** One level below the heading the grid sits under, so levels don't skip. */
  titleAs?: "h2" | "h3";
}) {
  const { authorName, tags } = painting;

  return (
    <div
      className="group animate-rise opacity-0"
      style={{ animationDelay: `${Math.min(index, 10) * 70}ms` }}
    >
      <div className="overflow-hidden rounded-sm border border-border/70 bg-card p-2.5 shadow-[0_1px_2px_rgba(0,0,34,0.06)] transition-all duration-300 motion-safe:group-hover:-translate-y-1 group-hover:shadow-[0_16px_32px_-12px_rgba(0,0,34,0.25)]">
        {/* The link covers the picture and title; the heart row sits outside
            it, since a button can't be nested inside a link. No prefetch:
            every card scrolled past was a background page render, most of
            Vercel's free 1M requests a month. */}
        <Link href={`/painting/${painting.id}`} prefetch={false} className="block">
          <div
            className={`relative w-full overflow-hidden rounded-[2px] bg-muted ${aspectRatio[painting.aspect]}`}
          >
            {/* Phones get the same 640px copy as desktops instead of the
                full stored file: a fraction of the bytes, a little softer
                on sharp phone screens. */}
            <PaintingImage
              src={painting.imageUrl}
              alt={painting.title}
              fill
              sizes="(min-width: 1024px) 24vw, (min-width: 640px) 40vw, 90vw"
              maxWidth={640}
              priority={index < 8}
              className="object-cover transition-transform duration-500 ease-out motion-safe:group-hover:scale-[1.04]"
            />
          </div>

          <div className="px-1 pt-3">
            <Title className="truncate font-heading text-lg leading-tight text-card-foreground">
              {painting.title}
            </Title>
            <p className="mt-0.5 text-xs tracking-wide text-muted-foreground uppercase">
              {authorName}
              {!painting.artistId && (
                <span className="ml-1.5 normal-case text-muted-foreground">
                  · guest
                </span>
              )}
            </p>
          </div>
        </Link>

        <div className="mt-2 flex items-center justify-between px-1 pb-0.5">
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 2).map((tag) => (
              <Badge
                key={tag.id}
                variant="secondary"
                className="rounded-sm text-[0.65rem] font-normal"
              >
                {tag.name}
              </Badge>
            ))}
          </div>
          {/* The button only reads its starting count once, so a refreshed
              count (Back from a painting) starts a new one. */}
          <LikeButton
            key={`${painting.likeCount}:${hearted}`}
            paintingId={painting.id}
            initialCount={painting.likeCount}
            initialHearted={hearted}
            compact
          />
        </div>
      </div>
    </div>
  );
}
