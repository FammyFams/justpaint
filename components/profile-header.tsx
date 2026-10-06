import { artistHref } from "@/lib/artist-url";
import { ArtistAvatar } from "@/components/artist-avatar";
import { EditProfileLink } from "@/components/edit-profile-link";
import { formatDate } from "@/lib/format";
import type { Artist } from "@/lib/types";

export function ProfileHeader({
  artist,
  paintingCount,
}: {
  artist: Artist;
  paintingCount: number;
}) {
  return (
    <div className="mb-10 flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <ArtistAvatar
          name={artist.displayName}
          src={artist.avatarUrl}
          className="size-16 text-lg sm:size-20"
        />
        <div>
          <h1 className="font-heading text-3xl italic leading-tight">
            {artist.displayName}
          </h1>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            {artist.bio}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            {paintingCount} {paintingCount === 1 ? "painting" : "paintings"} ·
            joined {formatDate(artist.joinedAt)}
          </p>
        </div>
      </div>

      <EditProfileLink artistId={artist.id} href={`${artistHref(artist)}/edit`} />
    </div>
  );
}
