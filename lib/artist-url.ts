// Profile addresses use the display name as written: "Gubigub" → /artist/Gubigub,
// "Ash W" → /artist/Ash-W. Names are unique ignoring case and only use
// letters, numbers, spaces, dots, dashes and underscores, so this is short
// and readable. Any other capitalization, and old /artist/<id> links, still
// work and redirect here.

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const NAME = /^[A-Za-z0-9._ -]+$/;

export function isUuid(value: string): boolean {
  return UUID.test(value);
}

export function artistSlug(displayName: string): string {
  return displayName.trim().replace(/ +/g, "-");
}

/** Link to a profile. Falls back to the id when there's no usable name. */
export function artistHref(artist: { id: string; displayName?: string | null }): string {
  const name = artist.displayName?.trim();
  return `/artist/${name && NAME.test(name) ? artistSlug(name) : artist.id}`;
}
