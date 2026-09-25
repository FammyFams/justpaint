import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "jp_admin";

/**
 * The cookie holds an HMAC derived from ADMIN_PASSWORD rather than the
 * password itself, so it can't be forged without knowing the password, and
 * changing the password logs out every existing admin session.
 */
export function adminToken(): string | null {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return null;
  return createHmac("sha256", password).update("justpaint-admin").digest("hex");
}

export function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

export async function isAdmin(): Promise<boolean> {
  const expected = adminToken();
  if (!expected) return false;
  const value = (await cookies()).get(ADMIN_COOKIE)?.value;
  return Boolean(value) && safeEqual(value!, expected);
}
