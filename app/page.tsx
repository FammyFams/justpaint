import type { Metadata } from "next";
import { getAllTags, getFeed } from "@/lib/paintings";
import { PaintingGrid } from "@/components/painting-grid";

export const metadata: Metadata = {
  title: "justpaint",
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  const { tag } = await searchParams;
  const [paintings, tags] = await Promise.all([getFeed(tag), getAllTags()]);
  const activeTag = tag ? tags.find((t) => t.slug === tag) : undefined;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-8 max-w-2xl sm:mb-10">
        <h1 className="font-heading text-4xl italic leading-none tracking-tight sm:text-5xl">
          JUST PAINT
        </h1>
        <p className="mt-3 text-muted-foreground">what did you paint today?</p>
      </div>

      {/* Tag filter row hidden for now; restore with
          <TagFilter tags={tags} activeTag={tag} /> from components/tag-filter. */}

      {activeTag && (
        <p className="mb-5 text-sm text-muted-foreground">
          Showing <span className="text-foreground">{activeTag.name}</span>:{" "}
          {paintings.length} {paintings.length === 1 ? "piece" : "pieces"}
        </p>
      )}

      <PaintingGrid paintings={paintings} />
    </main>
  );
}
