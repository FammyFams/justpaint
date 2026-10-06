// Profile pictures live in the paintings bucket under avatars/{userId}/,
// and profiles.avatar_url holds the file's public URL (lib/writes/avatar.ts).
// Only the server writes that column, but for one day in September 2026
// browsers could edit their own profile row (fixed in migration
// 20260926000002), so anything that isn't one of our files is ignored
// rather than shown.

const PREFIX = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/paintings/`;

/** The storage path (avatars/{userId}/...) behind a picture URL, or null if it isn't one of ours. */
export function avatarStoragePath(url: string | null | undefined): string | null {
  if (!url?.startsWith(PREFIX)) return null;
  const path = url.slice(PREFIX.length);
  return /^avatars\/[0-9a-f-]{36}\/[0-9a-f-]{36}\.webp$/.test(path) ? path : null;
}

/** The picture URL to show, or null for initials. */
export function avatarUrlOrNull(url: string | null | undefined): string | null {
  return avatarStoragePath(url) ? url! : null;
}
