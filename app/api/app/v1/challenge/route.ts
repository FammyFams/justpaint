import { json } from "@/lib/api/respond";
import { OCTOBER, RULES } from "@/lib/challenges";

// Built once at build time and served as a file: it's the same for everyone and
// only changes with a deploy, so it costs no server time. The app works out
// "today" itself from timeZone, so nothing here goes stale during the month.
//
// Still October: the app reads its entries from the october_challenge column,
// so it can't show a later challenge until it reads challenge and
// challenge_day (lib/challenges.ts).
export const dynamic = "force-static";

const CHALLENGE = OCTOBER;
const TIME_ZONE = "America/Los_Angeles";

export async function GET() {
  const month = String(CHALLENGE.monthNumber).padStart(2, "0");
  const date = (day: number) => `${CHALLENGE.year}-${month}-${String(day).padStart(2, "0")}`;
  return json(
    {
      challenge: {
        name: CHALLENGE.name,
        hashtag: CHALLENGE.hashtag,
        // Days are calendar days in this time zone, as on the website.
        timeZone: TIME_ZONE,
        startDate: date(1),
        endDate: date(CHALLENGE.prompts.length),
        prompts: CHALLENGE.prompts.map((prompt, i) => ({ day: i + 1, date: date(i + 1), prompt })),
        rules: RULES,
      },
    },
    { cache: "public, max-age=3600" }
  );
}
