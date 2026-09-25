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
  artistId: string;
  tagIds: string[];
  likeCount: number;
  createdAt: string;
}
