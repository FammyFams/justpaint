import type { Painting } from "@/lib/types";
import { PaintingCard } from "@/components/painting-card";
import { PROMPTS } from "@/lib/october-challenge";

export function PaintingGrid({
  paintings,
  heartedIds,
  emptyHint = "Try a different tag, or check back soon.",
  groupByOctoberDay = false,
  narrow = false,
}: {
  paintings: Painting[];
  /** Signed-in user's hearted painting ids; undefined for guests. */
  heartedIds?: string[];
  /** Second line of the empty state. */
  emptyHint?: string;
  /**
   * Splits the posts under a heading per challenge day ("October 22 · Pumpkin
   * pie"). Expects them already sorted by day.
   */
  groupByOctoberDay?: boolean;
  /** At most three columns, for pages narrower than the home feed. */
  narrow?: boolean;
}) {
  if (paintings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-sm border border-dashed border-border py-24 text-center">
        <p className="font-heading text-xl italic text-muted-foreground">
          Nothing here yet
        </p>
        <p className="text-sm text-muted-foreground">
          {emptyHint}
        </p>
      </div>
    );
  }

  const renderGrid = (items: Painting[], offset: number) => (
    <div
      className={`grid grid-cols-1 items-start gap-5 sm:grid-cols-2 lg:grid-cols-3 ${narrow ? "" : "xl:grid-cols-4"}`}
    >
      {items.map((painting, i) => (
        <PaintingCard
          key={painting.id}
          painting={painting}
          index={offset + i}
          hearted={heartedIds ? heartedIds.includes(painting.id) : undefined}
        />
      ))}
    </div>
  );

  if (!groupByOctoberDay) return renderGrid(paintings, 0);

  // Consecutive posts for the same day share one section.
  const groups: { day: number | null; items: Painting[]; offset: number }[] = [];
  paintings.forEach((painting, i) => {
    const last = groups.at(-1);
    if (last && last.day === painting.octoberDay) last.items.push(painting);
    else groups.push({ day: painting.octoberDay, items: [painting], offset: i });
  });

  return (
    <div className="flex flex-col gap-10">
      {groups.map((group) => (
        <section key={group.day ?? "none"} className="flex flex-col gap-5">
          <h2 className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 border-b border-border pb-2">
            {group.day ? (
              <>
                <span className="text-xs font-semibold tracking-widest text-primary uppercase">
                  October {group.day}
                </span>
                <span className="font-heading text-2xl font-semibold text-foreground">
                  {PROMPTS[group.day - 1]}
                </span>
              </>
            ) : (
              <span className="font-heading text-2xl font-semibold text-foreground">
                Other entries
              </span>
            )}
          </h2>
          {renderGrid(group.items, group.offset)}
        </section>
      ))}
    </div>
  );
}
