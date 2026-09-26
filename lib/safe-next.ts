// Where to send someone after logging in or confirming their email. Only
// paths on this site are allowed. Parsing with URL (the way browsers do) is
// what catches the tricky cases: "//evil.com", "/\evil.com", and "/\t/evil.com"
// (browsers drop tabs and newlines, turning it into "//evil.com").
const BASE = "https://justpaint.invalid";
const CONTROL_OR_BACKSLASH = /[\u0000-\u001f\u007f\\]/;

export function safeNext(requested: string | null | undefined): string {
  if (!requested || !requested.startsWith("/")) return "/";
  if (CONTROL_OR_BACKSLASH.test(requested)) return "/";
  try {
    const url = new URL(requested, BASE);
    if (url.origin !== BASE) return "/";
    return url.pathname + url.search + url.hash;
  } catch {
    return "/";
  }
}
