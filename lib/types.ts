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
  /** Their profile picture, or null for initials. */
  authorAvatarUrl: string | null;
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
  /** The artist's profile picture; null for initials and for guests. */
  authorAvatarUrl: string | null;
  tags: Tag[];
  likeCount: number;
  createdAt: string;
  /** Entered in the October painting challenge. */
  octoberChallenge: boolean;
  /** Day of the October challenge prompt it's for (1 = October 1), if any. */
  octoberDay: number | null;
}

export interface Artist {
  id: string;
  displayName: string;
  bio: string;
  /** Profile picture, or null for initials. */
  avatarUrl: string | null;
  joinedAt: string;
}
