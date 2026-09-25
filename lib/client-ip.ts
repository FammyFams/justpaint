import "server-only";
import { createHmac } from "node:crypto";
import { headers } from "next/headers";

/**
 * The requester's IP as a salted (HMAC) hash -- enough to tell repeat
 * visitors apart for rate limits and one-heart-per-painting, without ever
 * storing the IP itself.
 */
export async function hashedClientIp(): Promise<string> {
  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "unknown";
  return createHmac("sha256", process.env.SUPABASE_SECRET_KEY!)
    .update(ip)
    .digest("hex");
}
