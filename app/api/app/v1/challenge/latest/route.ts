import { challengeResponse } from "@/lib/api/challenge";
import { CURRENT_CHALLENGE } from "@/lib/challenges";

// The newest challenge in lib/challenges.ts, the same one the website's
// upload form offers. It moves on when the next month is added there and
// deployed; the app follows without an update.
export const dynamic = "force-static";

export function GET() {
  return challengeResponse(CURRENT_CHALLENGE);
}
