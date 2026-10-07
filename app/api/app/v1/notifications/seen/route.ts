import { getBearerUserId } from "@/lib/api/auth";
import { busy, json, unauthorized } from "@/lib/api/respond";
import { markNotificationsSeen } from "@/lib/notifications";

// Marks everything up to now as seen, like the website does once
// /notifications is on screen. The app calls it when the Activity tab opens.
//   POST /api/app/v1/notifications/seen → { seenAt }
export async function POST(request: Request) {
  const userId = await getBearerUserId(request);
  if (!userId) return unauthorized();

  const seenAt = await markNotificationsSeen(userId);
  if (!seenAt) return busy();
  return json({ seenAt });
}
