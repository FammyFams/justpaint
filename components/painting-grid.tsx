import type { Painting } from "@/lib/types";
import { PaintingCard } from "@/components/painting-card";

export function PaintingGrid({ paintings }: { paintings: Painting[] }) {
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
    <div className="columns-1 gap-5 sm:columns-2 lg:columns-3 xl:columns-4">
      {paintings.map((painting, index) => (
        <PaintingCard key={painting.id} painting={painting} index={index} />
      ))}
    </div>
  );
}
