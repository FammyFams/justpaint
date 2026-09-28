import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getArtistById, getPaintingsByArtist } from "@/lib/paintings";
import { getCurrentUser } from "@/lib/current-user";
import { getHeartedIds } from "@/lib/hearts";
import { ProfileHeader } from "@/components/profile-header";
import { PaintingGrid } from "@/components/painting-grid";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const artist = await getArtistById(id);
  if (!artist) return { title: "justpaint" };
  return {
    title: `${artist.displayName} | justpaint`,
    description: `Paintings by ${artist.displayName}, a painter in the justpaint beginner painting community.`,
    alternates: { canonical: `/artist/${artist.id}` },
    openGraph: { siteName: "justpaint", title: `Paintings by ${artist.displayName}` },
  };
}

export default async function ArtistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const artist = await getArtistById(id);
  if (!artist) notFound();

  const [paintings, currentUser] = await Promise.all([
    getPaintingsByArtist(artist.id),
    getCurrentUser(),
  ]);

  const heartedIds = currentUser
    ? await getHeartedIds(currentUser.id, paintings.map((p) => p.id))
    : undefined;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <ProfileHeader
        artist={artist}
        paintingCount={paintings.length}
        isOwnProfile={currentUser?.id === artist.id}
      />
      <PaintingGrid paintings={paintings} heartedIds={heartedIds} />
    </main>
  );
}
