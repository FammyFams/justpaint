import type { Metadata } from "next";
import { artistHref } from "@/lib/artist-url";
import { PaintingImage } from "@/components/painting-image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCommentsForPainting, getPaintingById } from "@/lib/paintings";
import { PaintingDeleteButton } from "@/components/admin-delete-button";
import { ArtistAvatar } from "@/components/artist-avatar";
import { Badge } from "@/components/ui/badge";
import { LikeButton } from "@/components/like-button";
import { CommentList } from "@/components/comment-list";
import { formatDate } from "@/lib/format";
import { CHALLENGE_NAME, PROMPTS } from "@/lib/october-challenge";
import { jsonLdHtml, paintingJsonLd } from "@/lib/seo";

// Cached per painting and the same for everyone; the heart, delete and
// comment buttons fill in from the browser. Hearts, comments and deletes
// rebuild the page right away (revalidatePath in their actions).
export const revalidate = 86400;

// None built ahead of time: each painting is built on its first visit, then
// cached.
export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const painting = await getPaintingById(id);
  if (!painting) return { title: "justpaint" };

  const medium = painting.tags[0]?.name.toLowerCase();
  const title = `${painting.title} by ${painting.authorName}`;
  const summary = painting.description.replace(/\s+/g, " ").trim();
  const description = `${title}, a beginner ${medium ? `${medium} ` : ""}painting shared on justpaint. ${
    summary.length > 110 ? `${summary.slice(0, 107)}...` : summary
  }`;
  // The share picture comes from ./opengraph-image.tsx (the whole painting
  // with its title), and the JSON-LD below points image search at the
  // painting itself.
  return {
    title: `${title} | justpaint`,
    description,
    alternates: { canonical: `/painting/${painting.id}` },
    openGraph: { siteName: "justpaint", type: "article", title, description },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function PaintingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const painting = await getPaintingById(id);
  if (!painting) notFound();

  const comments = await getCommentsForPainting(painting.id);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdHtml(paintingJsonLd(painting, comments.length))}
      />
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.3fr_1fr]">
        <div className="rounded-sm border border-border/70 bg-card p-3 shadow-[0_1px_2px_rgba(0,0,34,0.06)] sm:p-4">
          <div className="relative w-full overflow-hidden rounded-[2px] bg-muted">
            <PaintingImage
              src={painting.imageUrl}
              alt={painting.title}
              width={1000}
              height={
                painting.aspect === "portrait"
                  ? 1300
                  : painting.aspect === "square"
                    ? 1000
                    : 750
              }
              // The choice is 640 or the stored file. Below 1024px the
              // painting really is ~92vw, but "200px" makes every phone pick
              // 640 (the copy the feed already made) instead of the full file.
              sizes="(min-width: 1024px) 55vw, 200px"
              className="h-auto w-full"
              priority
            />
          </div>
        </div>

        <div>
          {painting.octoberChallenge && (
            <Link
              href="/october-challenge"
              className="mb-2 inline-block text-xs font-medium tracking-wide text-primary uppercase hover:underline"
            >
              {CHALLENGE_NAME}
              {painting.octoberDay &&
                ` · Day ${painting.octoberDay}: ${PROMPTS[painting.octoberDay - 1]}`}
            </Link>
          )}
          <h1 className="font-heading text-3xl italic leading-tight sm:text-4xl">
            {painting.title}
          </h1>

          {painting.artistId ? (
            <Link
              href={artistHref({ id: painting.artistId, displayName: painting.authorName })}
              className="mt-4 flex items-center gap-2.5"
            >
              <ArtistAvatar
                name={painting.authorName}
                src={painting.authorAvatarUrl}
                className="size-9"
              />
              <div>
                <p className="text-sm font-medium leading-tight">
                  {painting.authorName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(painting.createdAt)}
                </p>
              </div>
            </Link>
          ) : (
            <div className="mt-4 flex items-center gap-2.5">
              <ArtistAvatar name={painting.authorName} className="size-9" />
              <div>
                <p className="text-sm font-medium leading-tight">
                  {painting.authorName}{" "}
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
            {painting.tags.map((tag) => (
              <Link key={tag.id} href={`/?tag=${tag.slug}`}>
                <Badge variant="secondary" className="rounded-sm font-normal">
                  {tag.name}
                </Badge>
              </Link>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between gap-4">
            <LikeButton paintingId={painting.id} initialCount={painting.likeCount} />
            <PaintingDeleteButton
              paintingId={painting.id}
              artistId={painting.artistId}
              title={painting.title}
            />
          </div>

          <p className="mt-3 text-xs text-muted-foreground">
            <Link href={`/report?painting=${painting.id}`} prefetch={false} className="hover:text-foreground hover:underline">
              Report this post
            </Link>
          </p>

          {/* Comment notifications link here; scroll-mt clears the sticky header. */}
          <div id="comments" className="mt-10 scroll-mt-20 border-t border-border pt-6">
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
