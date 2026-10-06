import { json } from "@/lib/api/respond";
import { CHALLENGE_NAME, HASHTAG, PROMPTS, RULES } from "@/lib/october-challenge";

// Built once at build time and served as a file: it's the same for everyone and
// only changes with a deploy, so it costs no server time. The app works out
// "today" itself from timeZone, so nothing here goes stale during the month.
export const dynamic = "force-static";

const YEAR = 2026;
const TIME_ZONE = "America/Los_Angeles";

export async function GET() {
  const date = (day: number) => `${YEAR}-10-${String(day).padStart(2, "0")}`;
  return json(
    {
      challenge: {
        name: CHALLENGE_NAME,
        hashtag: HASHTAG,
        // Days are calendar days in this time zone, as on the website.
        timeZone: TIME_ZONE,
        startDate: date(1),
        endDate: date(PROMPTS.length),
        prompts: PROMPTS.map((prompt, i) => ({ day: i + 1, date: date(i + 1), prompt })),
        rules: RULES,
      },
    },
    { cache: "public, max-age=3600" }
  );
}
