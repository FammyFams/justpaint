import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { findArtist, getPaintingsByArtist } from "@/lib/paintings";
import { artistHref } from "@/lib/artist-url";
import { ProfileHeader } from "@/components/profile-header";
import { PaintingGrid } from "@/components/painting-grid";
import { artistJsonLd, jsonLdHtml } from "@/lib/seo";
import { CanonicalAddress } from "@/components/address-query";

// Cached per artist and the same for everyone. New posts, deletes and
// renames rebuild it right away; heart counts catch up within 10 minutes.
export const revalidate = 600;

// None built ahead of time: each profile is built on its first visit.
export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const artist = await findArtist(id);
  if (!artist) return { title: "justpaint" };
  return {
    title: `${artist.displayName} | justpaint`,
    description: `Paintings by ${artist.displayName}, a painter in the justpaint beginner painting community.`,
    alternates: { canonical: artistHref(artist) },
    // Share picture: ./opengraph-image.tsx.
    openGraph: { siteName: "justpaint", title: `Paintings by ${artist.displayName}` },
    twitter: { card: "summary_large_image", title: `Paintings by ${artist.displayName}` },
  };
}

export default async function ArtistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const artist = await findArtist(id);
  if (!artist) notFound();
  // Old id links and other spellings show the same profile and switch to
  // the one address for this name (CanonicalAddress, plus the canonical
  // link above for search engines).
  const href = artistHref(artist);

  const paintings = await getPaintingsByArtist(artist.id);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdHtml(artistJsonLd(artist, paintings))} />
      <CanonicalAddress href={href} />
      <ProfileHeader artist={artist} paintingCount={paintings.length} />
      <PaintingGrid paintings={paintings} />
    </main>
  );
}
