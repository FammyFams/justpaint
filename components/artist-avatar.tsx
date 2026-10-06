import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAvatarClasses, getInitials } from "@/lib/format";

/**
 * Someone's profile picture, or their initials when they haven't set one.
 * The name is always shown next to it, so the picture itself is silent for
 * screen readers.
 */
export function ArtistAvatar({
  name,
  src,
  className,
}: {
  name: string;
  src?: string | null;
  className?: string;
}) {
  return (
    <Avatar className={className}>
      {src && (
        // keepMounted puts the <img> in the cached page's HTML, so it starts
        // loading before React runs. Initials show underneath until it's in.
        <AvatarImage
          src={src}
          alt=""
          keepMounted
          className="absolute inset-0 data-error:hidden"
        />
      )}
      <AvatarFallback className={getAvatarClasses(name)}>{getInitials(name)}</AvatarFallback>
    </Avatar>
  );
}
