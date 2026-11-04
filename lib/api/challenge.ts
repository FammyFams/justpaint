import { createHash } from "node:crypto";
import { json } from "@/lib/api/respond";
import { RULES, challengePath, type Challenge } from "@/lib/challenges";
import { getSiteUrl } from "@/lib/site-url";

// The challenge as the app reads it (/api/app/v1/challenge and
// /api/app/v1/challenge/latest). Served as a static file built at deploy, so
// it costs no server time. The app works out "today" itself from timeZone, so
// nothing here goes stale during the month.

const TIME_ZONE = "America/Los_Angeles";

export function challengeResponse(c: Challenge) {
  const month = String(c.monthNumber).padStart(2, "0");
  const date = (day: number) => `${c.year}-${month}-${String(day).padStart(2, "0")}`;
  const pageUrl = `${getSiteUrl()}${challengePath(c)}`;
  // Changes when a prompt does, so phones fetch the new calendar picture
  // instead of showing the one they cached.
  const version = createHash("sha256").update(JSON.stringify(c.prompts)).digest("hex").slice(0, 8);
  return json(
    {
      challenge: {
        // What paintings.challenge holds for its entries.
        id: c.id,
        name: c.name,
        hashtag: c.hashtag,
        // Days are calendar days in this time zone, as on the website.
        timeZone: TIME_ZONE,
        startDate: date(1),
        endDate: date(c.prompts.length),
        // prompt is null for a day that isn't picked yet.
        prompts: c.prompts.map((prompt, i) => ({ day: i + 1, date: date(i + 1), prompt })),
        rules: RULES,
        pageUrl,
        calendarUrl: `${pageUrl}/calendar.png?v=${version}`,
      },
    },
    { cache: "public, max-age=3600" }
  );
}
