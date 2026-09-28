// Shared by the challenge page and anything else that shows the prompts.

// One prompt per day of October; index 0 is October 1.
export const PROMPTS = [
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
  "Pumpkin",
  "Bird",
  "Sandwich",
  "Mouse",
  "Magic cat",
  "Beer",
  "Chocolate",
  "Breakfast",
  "Candy corn",
  "Halloween",
];

// Day of October in Pacific time (where the site is run), or null outside
// October.
export function octoberDay(): number | null {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    month: "numeric",
    day: "numeric",
  }).formatToParts(new Date());
  const month = Number(parts.find((p) => p.type === "month")?.value);
  const day = Number(parts.find((p) => p.type === "day")?.value);
  return month === 10 ? day : null;
}

// October 1, 2026 is a Thursday (0 = Sunday), for laying out the calendar.
export const FIRST_WEEKDAY = 4;
export const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Shown on the challenge page and in the calendar picture.
export const RULES = [
  "Have fun.",
  "No old paintings. It must be a new painting.",
  "Include your palette in the picture if you can.",
  "Posting on justpaint.art is encouraged.",
];
