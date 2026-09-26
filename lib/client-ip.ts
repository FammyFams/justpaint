import "server-only";
import { createHmac } from "node:crypto";
import { isIPv6 } from "node:net";
import { headers } from "next/headers";

// IPv6 users typically get a whole /64 block per household and can rotate
// addresses inside it freely, so count the /64 as one visitor. Otherwise one
// device could hand out extra hearts or dodge the upload limit.
function rateLimitKey(ip: string): string {
  if (!isIPv6(ip)) return ip;
  const [head, tail = ""] = ip.split("::");
  const headParts = head ? head.split(":") : [];
  const tailParts = tail ? tail.split(":") : [];
  const missing = 8 - headParts.length - tailParts.length;
  const full = [...headParts, ...Array(Math.max(missing, 0)).fill("0"), ...tailParts];
  return full.slice(0, 4).map((part) => part.toLowerCase().padStart(4, "0")).join(":") + "::/64";
}

function hmac(value: string): string {
  const secret = process.env.IP_HASH_SECRET || process.env.SUPABASE_SECRET_KEY!;
  return createHmac("sha256", secret).update(value).digest("hex");
}

/**
 * The requester's IP as a salted (HMAC) hash -- enough to tell repeat
 * visitors apart for rate limits and one-heart-per-painting, without ever
 * storing the IP itself. On Vercel, x-forwarded-for is set by the edge
 * network, so visitors can't spoof it.
 *
 * Keyed with IP_HASH_SECRET when it's set. Falls back to the Supabase secret
 * key, which is what it used originally; switching secrets resets rate limits
 * and lets people heart a painting again once.
 */
export async function hashedClientIp(): Promise<string> {
  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "unknown";
  return hmac(rateLimitKey(ip));
}

/**
 * Who's asking, for upload limits and hearts. Signed-in people count per
 * account (so housemates on one Wi-Fi each get their own, and hearts follow
 * the account across devices); everyone else counts per IP. Hashed either
 * way, and the "user:" prefix keeps the two kinds from ever colliding.
 */
export async function visitorKey(userId: string | null): Promise<string> {
  return userId ? hmac(`user:${userId}`) : hashedClientIp();
}
