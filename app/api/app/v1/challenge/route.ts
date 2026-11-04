import { challengeResponse } from "@/lib/api/challenge";
import { OCTOBER } from "@/lib/challenges";

// Always October, for app builds from before ./latest: they read entries from
// the october_challenge column and post with octoberChallenge, so a later
// month here would label October's entries with its prompts and file their
// new entries under October.
export const dynamic = "force-static";

export function GET() {
  return challengeResponse(OCTOBER);
}
