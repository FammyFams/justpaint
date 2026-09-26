import type { Painting } from "@/lib/types";
import { PaintingCard } from "@/components/painting-card";

export function PaintingGrid({
  paintings,
  heartedIds,
}: {
  paintings: Painting[];
  /** Signed-in user's hearted painting ids; undefined for guests. */
  heartedIds?: string[];
}) {
  if (paintings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-sm border border-dashed border-border py-24 text-center">
        <p className="font-heading text-xl italic text-muted-foreground">
          Nothing here yet
        </p>
        <p className="text-sm text-muted-foreground">
          Try a different tag, or check back soon.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 items-start gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {paintings.map((painting, index) => (
        <PaintingCard
          key={painting.id}
          painting={painting}
          index={index}
          hearted={heartedIds ? heartedIds.includes(painting.id) : undefined}
        />
      ))}
    </div>
  );
}
