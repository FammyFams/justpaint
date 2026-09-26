import Link from "next/link";
import Image from "next/image";
import type { Painting } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { LikeButton } from "@/components/like-button";
import { Watermark } from "@/components/watermark";

const aspectRatio: Record<Painting["aspect"], string> = {
  portrait: "aspect-[3/4]",
  landscape: "aspect-[4/3]",
  square: "aspect-square",
};

export function PaintingCard({
  painting,
  index = 0,
}: {
  painting: Painting;
  index?: number;
}) {
  const { authorName, tags } = painting;

  return (
    <div
      className="group animate-rise opacity-0"
      style={{ animationDelay: `${Math.min(index, 10) * 70}ms` }}
    >
      <div className="overflow-hidden rounded-sm border border-border/70 bg-card p-2.5 shadow-[0_1px_2px_rgba(0,0,34,0.06)] transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_16px_32px_-12px_rgba(0,0,34,0.25)]">
        {/* The link covers the picture and title; the heart row sits outside
            it, since a button can't be nested inside a link. */}
        <Link href={`/painting/${painting.id}`} className="block">
          <div
            className={`relative w-full overflow-hidden rounded-[2px] bg-muted ${aspectRatio[painting.aspect]}`}
          >
            <Image
              src={painting.imageUrl}
              alt={painting.title}
              fill
              sizes="(min-width: 1024px) 24vw, (min-width: 640px) 40vw, 90vw"
              priority={index < 8}
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
            />
            <Watermark size="sm" />
          </div>

          <div className="px-1 pt-3">
            <h3 className="truncate font-heading text-lg leading-tight text-card-foreground">
              {painting.title}
            </h3>
            <p className="mt-0.5 text-xs tracking-wide text-muted-foreground uppercase">
              {authorName}
              {!painting.artistId && (
                <span className="ml-1.5 normal-case text-muted-foreground/70">
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
          <LikeButton
            paintingId={painting.id}
            initialCount={painting.likeCount}
            initialLiked={false}
            isLoggedIn={false}
            compact
          />
        </div>
      </div>
    </div>
  );
}
