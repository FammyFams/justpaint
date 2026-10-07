import { getBearerUserId } from "@/lib/api/auth";
import { apiError, busy, json, unauthorized } from "@/lib/api/respond";
import { isUuid } from "@/lib/artist-url";
import { getHeartedIds } from "@/lib/hearts";

const MOST_IDS = 100;

// Which paintings the signed-in user hearted, so the app can fill in hearts.
//   GET /api/app/v1/hearts            every one (the newest 1,000); the app
//                                     asks once, not once per page
//   GET /api/app/v1/hearts?ids=a,b,c  just which of these (up to 100)
// → { hearted: [paintingId, ...] }
export async function GET(request: Request) {
  const userId = await getBearerUserId(request);
  if (!userId) return unauthorized();

  const param = new URL(request.url).searchParams.get("ids");
  const among = param === null ? undefined : param.split(",").filter(Boolean);
  if (among) {
    if (among.length > MOST_IDS || !among.every(isUuid)) {
      return apiError(400, "invalid", `send up to ${MOST_IDS} painting ids, separated by commas.`);
    }
    if (among.length === 0) return json({ hearted: [] });
  }

  const hearted = await getHeartedIds(userId, among);
  if (!hearted) return busy();
  return json({ hearted });
}
