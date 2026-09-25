export interface Artist {
  id: string;
  displayName: string;
  bio: string;
  joinedAt: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface Comment {
  id: string;
  paintingId: string;
  artistId: string;
  body: string;
  createdAt: string;
}

export interface Painting {
  id: string;
  title: string;
  description: string;
  imagePath: string;
  aspect: "portrait" | "landscape" | "square";
  /** Null for guest uploads — posting doesn't require an account. */
  artistId: string | null;
  /** Attribution name for guest uploads (artistId is null). Ignored otherwise. */
  guestName?: string;
  tagIds: string[];
  likeCount: number;
  createdAt: string;
}
