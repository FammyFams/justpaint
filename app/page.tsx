import type { Metadata } from "next";
import { getFeed, getTagById } from "@/lib/mock-data";
import { PaintingGrid } from "@/components/painting-grid";
import { TagFilter } from "@/components/tag-filter";

export const metadata: Metadata = {
  title: "justpaint — a place to hang your paintings",
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  const { tag } = await searchParams;
  const paintings = getFeed(tag);
  const activeTag = tag ? getTagById(tag) : undefined;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-8 max-w-2xl sm:mb-10">
        <h1 className="font-heading text-4xl italic leading-none tracking-tight sm:text-5xl">
          Wander the gallery.
        </h1>
        <p className="mt-3 text-muted-foreground">
          Fresh work from painters posting as they finish it. No algorithm,
          just a wall and whoever hung something on it today.
        </p>
      </div>

      <div className="mb-8">
        <TagFilter activeTag={tag} />
      </div>

      {activeTag && (
        <p className="mb-5 text-sm text-muted-foreground">
          Showing <span className="text-foreground">{activeTag.name}</span> —{" "}
          {paintings.length} {paintings.length === 1 ? "piece" : "pieces"}
        </p>
      )}

      <PaintingGrid paintings={paintings} />
    </main>
  );
}
