// The monthly painting challenges. Each one has its own page
// (/november-challenge), home feed tab (/?challenge=november) and calendar
// picture, all built from what's here. Adding a month: a new entry at the
// top of CHALLENGES, a copy of app/november-challenge, and its slug in the
// challenge rewrite in next.config.ts.

export interface Challenge {
  /** Stored in paintings.challenge. */
  id: string;
  /** In addresses: /november-challenge, /?challenge=november. */
  slug: string;
  /** "November Painting Challenge 2026", wherever the site names it. */
  name: string;
  /** Shorter, for the home feed's tab. */
  tabName: string;
  /** For posts elsewhere (Instagram, TikTok), so entries can be found. */
  hashtag: string;
  month: string;
  /** 1 = January. */
  monthNumber: number;
  year: number;
  /** One per day of the month; index 0 is day 1. null until it's picked. */
  prompts: readonly (string | null)[];
  /** A day shown in orange on the calendars (Halloween). */
  holiday?: number;
  /** For search results and link previews. */
  description: string;
  keywords: string[];
  /** The About section's first paragraph. */
  about: string;
  /** A few prompts shown on the page's share card. */
  cardPrompts: string[];
  /** Pacific time with that day's offset, for search engines. */
  startDate: string;
  endDate: string;
  /** When the page went up. */
  announced: string;
}

function monthChallenge(
  c: Omit<Challenge, "id" | "slug" | "name" | "tabName" | "hashtag">
): Challenge {
  const slug = c.month.toLowerCase();
  return {
    ...c,
    id: `${slug}-${c.year}`,
    slug,
    name: `${c.month} Painting Challenge ${c.year}`,
    tabName: `${c.month} Challenge ${c.year}`,
    hashtag: `#justpaint${c.month}${c.year}`,
  };
}

export const NOVEMBER = monthChallenge({
  month: "November",
  monthNumber: 11,
  year: 2026,
  // Fill these in as they're decided ("Taco" in quotes in place of null).
  // A null day shows "Coming soon" and a blank calendar square.
  prompts: [
    /* 1 */ "Mountain peak",
    /* 2 */ "Jellyfish",
    /* 3 */ "Strawberry",
    /* 4 */ "Happy cat",
    /* 5 */ "Bird",
    /* 6 */ "Rolling mountain",
    /* 7 */ "Lemon",
    /* 8 */ "Dancing",
    /* 9 */ "Moon",
    /* 10 */ "City",
    /* 11 */ "Dress",
    /* 12 */ "Stars",
    /* 13 */ "Silhouette",
    /* 14 */ "Butterfly",
    /* 15 */ "Duck",
    /* 16 */ "Bear",
    /* 17 */ "Alien",
    /* 18 */ "Shoes",
    /* 19 */ "Soup",
    /* 20 */ "Pine tree",
    /* 21 */ "Red barn",
    /* 22 */ "Sheep",
    /* 23 */ "Cow",
    /* 24 */ "Acorn",
    /* 25 */ "Mushroom",
    /* 26 */ "Turkey", // Thanksgiving
    /* 27 */ "Too full",
    /* 28 */ "Leftovers",
    /* 29 */ "Hot cocoa",
    /* 30 */ "First snow",
  ],
  description:
    "The November Painting Challenge 2026, free for beginners: 30 daily painting prompts, one for each day of November. Paint one a day and share it on justpaint.",
  keywords: [
    "November painting challenge",
    "daily painting prompts",
    "November art prompts",
    "painting challenge for beginners",
    "watercolor challenge",
    "fall painting ideas",
  ],
  about:
    "The November Painting Challenge 2026 is a free, month long painting challenge for beginners. There is one simple prompt for each day of November. Paint the day’s prompt, or any prompt you like, and share it with everyone else painting along.",
  // Six short prompts for the share card.
  cardPrompts: ["Jellyfish", "Strawberry", "Happy cat", "Lemon", "Moon", "Turkey"],
  // Daylight time ends at 2 a.m. on November 1.
  startDate: "2026-11-01T00:00:00-07:00",
  endDate: "2026-11-30T23:59:00-08:00",
  announced: "2026-11-02",
});

export const OCTOBER = monthChallenge({
  month: "October",
  monthNumber: 10,
  year: 2026,
  prompts: [
    "Cow",
    "Orange leaf",
    "Snoopy dog",
    "Cinnamon roll",
    "Apple",
    "Taco",
    "Pumpkin",
    "Banana",
    "Cupcake",
    "Nature park",
    "Pizza",
    "Raining",
    "Boat",
    "Hair",
    "Angry cat",
    "Sports",
    "Pasta",
    "Happy frog",
    "House",
    "Chicken",
    "Apple tree",
    "Pumpkin pie",
    "Bird",
    "Sandwich",
    "Mouse",
    "Magic cat",
    "Beer",
    "Chocolate",
    "Breakfast",
    "Candy corn",
    "Halloween",
  ],
  holiday: 31,
  description:
    "The October Painting Challenge 2026, free for beginners: 31 daily prompts, from a cow and a pumpkin to candy corn and Halloween. Paint one a day and share it on justpaint.",
  keywords: [
    "October painting challenge",
    "daily painting prompts",
    "October art prompts",
    "painting challenge for beginners",
    "watercolor challenge",
    "Halloween painting ideas",
  ],
  about:
    "The October Painting Challenge 2026 is a free, month long painting challenge for beginners. There is one simple prompt for each day of October, from a cow on day 1 to Halloween on day 31. Paint the day’s prompt, or any prompt you like, and share it with everyone else painting along.",
  cardPrompts: ["Cow", "Orange leaf", "Pumpkin", "Happy frog", "Magic cat", "Candy corn"],
  startDate: "2026-10-01T00:00:00-07:00",
  endDate: "2026-10-31T23:59:00-07:00",
  announced: "2026-09-27",
});

/** Newest first. The first is the one the upload form and home page offer. */
export const CHALLENGES = [NOVEMBER, OCTOBER];
export const CURRENT_CHALLENGE = CHALLENGES[0];

export function challengeById(id: string | null | undefined): Challenge | undefined {
  return CHALLENGES.find((c) => c.id === id);
}

export function challengeBySlug(slug: string | null | undefined): Challenge | undefined {
  return CHALLENGES.find((c) => c.slug === slug);
}

export function challengePath(c: Challenge) {
  return `/${c.slug}-challenge`;
}

/** The day's prompt, or null if it isn't picked yet. */
export function promptFor(c: Challenge, day: number | null | undefined): string | null {
  return day ? (c.prompts[day - 1] ?? null) : null;
}

// Today in Pacific time, where the site is run.
function pacificToday() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(new Date());
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return { year: get("year"), month: get("month"), day: get("day") };
}

/** Today's day of the challenge, or null outside its month. */
export function challengeDay(c: Challenge): number | null {
  const today = pacificToday();
  return today.year === c.year && today.month === c.monthNumber ? today.day : null;
}

/** Its month is over. */
export function challengeOver(c: Challenge) {
  const today = pacificToday();
  return today.year * 12 + today.month > c.year * 12 + c.monthNumber;
}

/**
 * The last day whose entries the challenge's lists show: today during the
 * month, every day once it's over, none before it starts. An entry posted
 * early for a later prompt (day 22 on the 9th) waits for its day.
 */
export function lastShownDay(c: Challenge): number {
  const today = pacificToday();
  const now = today.year * 12 + today.month;
  const month = c.year * 12 + c.monthNumber;
  if (now > month) return c.prompts.length;
  if (now < month) return 0;
  return today.day;
}

/**
 * The database columns for a post's challenge entry. App builds from before
 * /api/app/v1/challenge/latest still read October's own columns, so those are
 * kept in step while people still use those builds.
 */
export function challengeColumns(id: string | null, day: number | null) {
  const october = id === OCTOBER.id;
  return {
    challenge: id,
    challenge_day: id ? day : null,
    october_challenge: october,
    october_day: october ? day : null,
  };
}

export const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export type CalendarCell =
  | { kind: "day"; day: number; weekday: number }
  | { kind: "blank"; span: number }
  /** A line about the challenge, in the blanks before day 1 or after the last day. */
  | { kind: "intro"; span: number; side: "start" | "end" };

/**
 * The month in weeks of 7, for the calendar on the page and in the picture.
 * The line about the challenge goes in the blanks before day 1 if there are
 * at least two, else in the blanks after the last day.
 */
export function calendarWeeks(c: Challenge): CalendarCell[][] {
  const lead = new Date(Date.UTC(c.year, c.monthNumber - 1, 1)).getUTCDay();
  const days = c.prompts.length;
  const trail = (7 - ((lead + days) % 7)) % 7;
  const introSide = lead >= 2 ? "start" : trail >= 2 ? "end" : null;

  const weeks: CalendarCell[][] = [];
  let week: CalendarCell[] = [];
  if (lead) {
    week.push(introSide === "start" ? { kind: "intro", span: lead, side: "start" } : { kind: "blank", span: lead });
  }
  for (let day = 1; day <= days; day++) {
    const weekday = (lead + day - 1) % 7;
    week.push({ kind: "day", day, weekday });
    if (weekday === 6) {
      weeks.push(week);
      week = [];
    }
  }
  if (trail) {
    week.push(introSide === "end" ? { kind: "intro", span: trail, side: "end" } : { kind: "blank", span: trail });
  }
  if (week.length) weeks.push(week);
  return weeks;
}

// Shown on every challenge page and in the calendar pictures.
export const RULES = [
  "Have fun.",
  "No old paintings. It must be a new painting.",
  "Include your palette in the picture if you can.",
  "Posting on justpaint.art is encouraged.",
];
