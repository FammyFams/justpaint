export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface Comment {
  id: string;
  paintingId: string;
  authorId: string;
  authorName: string;
  body: string;
  createdAt: string;
}

export interface Painting {
  id: string;
  title: string;
  description: string;
  imagePath: string;
  imageUrl: string;
  aspect: "portrait" | "landscape" | "square";
  /** Null for guest uploads, since posting doesn't require an account. */
  artistId: string | null;
  /** Display name to credit: the artist's profile name, or the guest's typed name. */
  authorName: string;
  tags: Tag[];
  likeCount: number;
  createdAt: string;
}

export interface Artist {
  id: string;
  displayName: string;
  bio: string;
  joinedAt: string;
}
