import { failed, json, readJson } from "@/lib/api/respond";
import { createClient } from "@/lib/supabase/server";
import { setHeart } from "@/lib/writes/hearts";

// The website's heart button (components/like-button.tsx). Body: { hearted }
// → { hearted, count }. Signed in it counts per account, otherwise per IP,
// the same rules as the app's /api/app/v1/hearts.
//
// A route handler rather than a server action: revalidatePath inside a
// server action re-renders the page the visitor is on and sends it back
// with the answer, and makes every page they visited earlier reload on the
// next visit. The button needs only the count. Here it just marks the
// painting page to rebuild on its next visit.
//
// PUT with a JSON body, so another site can't send it from a form, and a
// cross-site fetch would need a CORS preflight this route doesn't answer.
export async function PUT(request: Request, { params }: { params: Promise<{ paintingId: string }> }) {
  const { data: claims } = await (await createClient()).auth.getClaims();
  const { paintingId } = await params;
  const body = await readJson(request);
  const hearted = body && typeof body === "object" ? (body as { hearted?: unknown }).hearted : undefined;

  const result = await setHeart(claims?.claims?.sub ?? null, paintingId, hearted);
  if (!result.ok) return failed(result);
  return json({ hearted: result.hearted, count: result.count });
}
