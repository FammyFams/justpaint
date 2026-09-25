import type { Artist, Comment, Painting, Tag } from "@/lib/types";

export const artists: Artist[] = [
  {
    id: "mara-voss",
    displayName: "Mara Voss",
    bio: "Abstract painter working in oil and cold wax. Based in Lisbon, drawn to coastlines and shifting light.",
    joinedAt: "2025-11-02",
  },
  {
    id: "theo-lindqvist",
    displayName: "Theo Lindqvist",
    bio: "Ink and mixed-media artist. Former architect; still can't stop drawing straight lines that bend.",
    joinedAt: "2025-12-14",
  },
  {
    id: "priya-nandakumar",
    displayName: "Priya Nandakumar",
    bio: "Watercolorist exploring color field and memory. Two cats, one very small studio.",
    joinedAt: "2026-01-08",
  },
  {
    id: "sam-okafor",
    displayName: "Sam Okafor",
    bio: "Self-taught, mostly nocturnal. Interested in what static and stillness look like on canvas.",
    joinedAt: "2026-02-19",
  },
  {
    id: "ines-duarte",
    displayName: "Ines Duarte",
    bio: "Landscape-adjacent abstraction. Painting the same five fields since 2019 and still not bored.",
    joinedAt: "2026-03-27",
  },
];

export const tags: Tag[] = [
  { id: "abstract", name: "Abstract", slug: "abstract" },
  { id: "mixed-media", name: "Mixed Media", slug: "mixed-media" },
  { id: "oil", name: "Oil", slug: "oil" },
  { id: "watercolor", name: "Watercolor", slug: "watercolor" },
  { id: "ink-wash", name: "Ink & Wash", slug: "ink-wash" },
  { id: "color-field", name: "Color Field", slug: "color-field" },
  { id: "landscape", name: "Landscape", slug: "landscape" },
  { id: "contemporary", name: "Contemporary", slug: "contemporary" },
];

export const paintings: Painting[] = [
  {
    id: "coastal-reverie",
    title: "Coastal Reverie",
    description:
      "Layers of cold wax and oil built up over three weeks, chasing the exact gray-blue of the Atlantic in February.",
    imagePath: "/paintings/coastal-reverie.svg",
    aspect: "landscape",
    artistId: "mara-voss",
    tagIds: ["oil", "landscape", "abstract"],
    likeCount: 42,
    createdAt: "2026-06-01T09:15:00Z",
  },
  {
    id: "autumn-whispers",
    title: "Autumn Whispers",
    description: "A study in rust and ochre. Third piece in a series about things that are ending on purpose.",
    imagePath: "/paintings/autumn-whispers.svg",
    aspect: "portrait",
    artistId: "ines-duarte",
    tagIds: ["landscape", "color-field"],
    likeCount: 28,
    createdAt: "2026-06-03T14:40:00Z",
  },
  {
    id: "midnight-bloom",
    title: "Midnight Bloom",
    description: "Ink and gouache on hot-press paper. Made in one sitting, at the hour the title suggests.",
    imagePath: "/paintings/midnight-bloom.svg",
    aspect: "square",
    artistId: "sam-okafor",
    tagIds: ["ink-wash", "abstract", "contemporary"],
    likeCount: 61,
    createdAt: "2026-06-05T22:05:00Z",
  },
  {
    id: "golden-hour",
    title: "Golden Hour",
    description: "Warm color-field study. I kept adding yellow until it stopped looking anxious.",
    imagePath: "/paintings/golden-hour.svg",
    aspect: "landscape",
    artistId: "priya-nandakumar",
    tagIds: ["watercolor", "color-field"],
    likeCount: 35,
    createdAt: "2026-06-07T11:20:00Z",
  },
  {
    id: "quiet-static",
    title: "Quiet Static",
    description: "Trying to paint the sound a room makes when no one's talking. Mixed media on panel.",
    imagePath: "/paintings/quiet-static.svg",
    aspect: "portrait",
    artistId: "sam-okafor",
    tagIds: ["mixed-media", "abstract"],
    likeCount: 19,
    createdAt: "2026-06-09T20:00:00Z",
  },
  {
    id: "desert-bloom",
    title: "Desert Bloom",
    description: "Terracotta and sand tones, built from photos of a trip to the Alentejo that I mostly remember wrong.",
    imagePath: "/paintings/desert-bloom.svg",
    aspect: "square",
    artistId: "ines-duarte",
    tagIds: ["landscape", "oil", "contemporary"],
    likeCount: 24,
    createdAt: "2026-06-11T08:45:00Z",
  },
  {
    id: "ink-and-ash",
    title: "Ink & Ash",
    description: "Sumi ink over charcoal ground. The least planned thing I've made all year, and I like it most.",
    imagePath: "/paintings/ink-and-ash.svg",
    aspect: "portrait",
    artistId: "theo-lindqvist",
    tagIds: ["ink-wash", "abstract"],
    likeCount: 53,
    createdAt: "2026-06-13T16:10:00Z",
  },
  {
    id: "paper-moon",
    title: "Paper Moon",
    description:
      "First painting I've finished in years. No account, just wanted to put it somewhere people might see it.",
    imagePath: "/paintings/paper-moon.svg",
    aspect: "landscape",
    artistId: null,
    guestName: "R. Alvarez",
    tagIds: ["mixed-media", "contemporary"],
    likeCount: 17,
    createdAt: "2026-06-15T13:30:00Z",
  },
  {
    id: "low-tide",
    title: "Low Tide",
    description: "Sea-glass palette, thinned oil on canvas board. Painted at the same spot every morning for a week.",
    imagePath: "/paintings/low-tide.svg",
    aspect: "square",
    artistId: "mara-voss",
    tagIds: ["oil", "landscape", "color-field"],
    likeCount: 38,
    createdAt: "2026-06-17T07:55:00Z",
  },
  {
    id: "ochre-fields",
    title: "Ochre Fields",
    description: "Flat planes of color, architectural in a way I didn't intend but won't fight.",
    imagePath: "/paintings/ochre-fields.svg",
    aspect: "landscape",
    artistId: "theo-lindqvist",
    tagIds: ["color-field", "abstract"],
    likeCount: 22,
    createdAt: "2026-06-19T18:25:00Z",
  },
  {
    id: "after-the-rain",
    title: "After the Rain",
    description: "Wet-on-wet watercolor, let the pigment do most of the deciding. Framed the happiest accident.",
    imagePath: "/paintings/after-the-rain.svg",
    aspect: "portrait",
    artistId: "priya-nandakumar",
    tagIds: ["watercolor", "landscape"],
    likeCount: 46,
    createdAt: "2026-06-21T10:05:00Z",
  },
  {
    id: "static-garden",
    title: "Static Garden",
    description: "Acrylic and spray on canvas. Started as a garden, ended as whatever this is. Kept the title anyway.",
    imagePath: "/paintings/static-garden.svg",
    aspect: "square",
    artistId: "sam-okafor",
    tagIds: ["mixed-media", "abstract", "contemporary"],
    likeCount: 31,
    createdAt: "2026-06-23T21:15:00Z",
  },
];

export const comments: Comment[] = [
  {
    id: "c1",
    paintingId: "coastal-reverie",
    artistId: "theo-lindqvist",
    body: "That gray-blue is exactly right. What are you cutting the wax with?",
    createdAt: "2026-06-01T12:30:00Z",
  },
  {
    id: "c2",
    paintingId: "coastal-reverie",
    artistId: "priya-nandakumar",
    body: "This makes me want to go stand somewhere cold and windy.",
    createdAt: "2026-06-02T09:10:00Z",
  },
  {
    id: "c3",
    paintingId: "midnight-bloom",
    artistId: "mara-voss",
    body: "One sitting?! The control in that top-right passage doesn't look rushed at all.",
    createdAt: "2026-06-06T08:00:00Z",
  },
  {
    id: "c4",
    paintingId: "midnight-bloom",
    artistId: "ines-duarte",
    body: "Favorite one you've posted so far.",
    createdAt: "2026-06-06T09:45:00Z",
  },
  {
    id: "c5",
    paintingId: "ink-and-ash",
    artistId: "sam-okafor",
    body: "The charcoal ground is doing so much work here. Stealing this technique, sorry not sorry.",
    createdAt: "2026-06-14T07:20:00Z",
  },
  {
    id: "c6",
    paintingId: "after-the-rain",
    artistId: "mara-voss",
    body: "'Framed the happiest accident' might be my favorite artist statement ever written.",
    createdAt: "2026-06-21T15:00:00Z",
  },
  {
    id: "c7",
    paintingId: "low-tide",
    artistId: "ines-duarte",
    body: "Same spot every morning for a week — you can feel the light changing across the series.",
    createdAt: "2026-06-18T06:40:00Z",
  },
];

export function getArtistById(id: string | null | undefined): Artist | undefined {
  if (!id) return undefined;
  return artists.find((artist) => artist.id === id);
}

export function getPaintingAuthorName(painting: Painting): string {
  if (painting.artistId) {
    return getArtistById(painting.artistId)?.displayName ?? "Unknown artist";
  }
  return painting.guestName?.trim() || "Guest";
}

export function getPaintingById(id: string): Painting | undefined {
  return paintings.find((painting) => painting.id === id);
}

export function getPaintingsByArtist(artistId: string): Painting[] {
  return paintings
    .filter((painting) => painting.artistId === artistId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getCommentsForPainting(paintingId: string): Comment[] {
  return comments
    .filter((comment) => comment.paintingId === paintingId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function getTagById(id: string): Tag | undefined {
  return tags.find((tag) => tag.id === id);
}

export function getTagsForPainting(painting: Painting): Tag[] {
  return painting.tagIds
    .map((tagId) => getTagById(tagId))
    .filter((tag): tag is Tag => Boolean(tag));
}

export function getFeed(tagSlug?: string): Painting[] {
  const sorted = [...paintings].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  if (!tagSlug) return sorted;
  return sorted.filter((painting) => painting.tagIds.includes(tagSlug));
}
