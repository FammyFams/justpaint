import type { Artist, Painting } from "@/lib/types";
import { artistHref } from "@/lib/artist-url";
import { getSiteUrl } from "@/lib/site-url";

// Shared search/share wording, aimed at people looking for a place to share
// beginner paintings. Kept under about 155 characters so Google shows it whole.
export const SITE_DESCRIPTION =
  "A friendly painting community for beginners. Share what you painted today, see other beginner paintings, and get hearts and comments. Free.";

// Tags that name a medium (a paint, or digital) rather than a subject or style.
const MEDIUM_TAGS = new Set([
  "oil",
  "watercolor",
  "gouache",
  "acrylic",
  "ink-wash",
  "mixed-media",
  "digital",
]);

/**
 * schema.org data for a painting page: the artwork, who painted it (Google
 * Images shows this as the creator), and its hearts and comments.
 */
export function paintingJsonLd(painting: Painting, commentCount: number) {
  const site = getSiteUrl();
  const creator = {
    "@type": "Person",
    name: painting.authorName,
    ...(painting.artistId && {
      url: `${site}${artistHref({ id: painting.artistId, displayName: painting.authorName })}`,
    }),
  };
  const media = painting.tags.filter((t) => MEDIUM_TAGS.has(t.slug)).map((t) => t.name);
  return {
    "@context": "https://schema.org",
    "@type": "VisualArtwork",
    name: painting.title,
    description: painting.description,
    url: `${site}/painting/${painting.id}`,
    artform: "Painting",
    ...(media.length > 0 && { artMedium: media.join(", ") }),
    keywords: painting.tags.map((t) => t.name).join(", "),
    datePublished: painting.createdAt,
    creator,
    image: {
      "@type": "ImageObject",
      contentUrl: painting.imageUrl,
      creator,
      creditText: painting.authorName,
    },
    commentCount,
    interactionStatistic: {
      "@type": "InteractionCounter",
      interactionType: "https://schema.org/LikeAction",
      userInteractionCount: painting.likeCount,
    },
  };
}

/** schema.org ProfilePage data for an artist's page. */
export function artistJsonLd(artist: Artist, paintings: Painting[]) {
  const url = `${getSiteUrl()}${artistHref(artist)}`;
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url,
    dateCreated: artist.joinedAt,
    mainEntity: {
      "@type": "Person",
      name: artist.displayName,
      url,
      ...(artist.bio && { description: artist.bio }),
      ...(paintings[0] && { image: paintings[0].imageUrl }),
      agentInteractionStatistic: {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/WriteAction",
        userInteractionCount: paintings.length,
      },
    },
  };
}

/**
 * JSON for a <script type="application/ld+json">. Writes each "<" as a JSON
 * escape so text people typed (a bio, a painting description) can't close
 * the tag with "</script>" and run a script of its own. The replacement
 * needs two backslashes: with one, it's just "<" again (that bug was live
 * from 2026-10-04 to 2026-10-09).
 */
export function jsonLdHtml(data: object) {
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}
