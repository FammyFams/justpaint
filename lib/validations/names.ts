import * as z from "zod";

// Matches the database constraints (migration 20260926000002): letters,
// numbers, spaces, dots, dashes and underscores, no leading/trailing space,
// at most 30 characters. Keeping to these characters blocks look-alike
// letters from other alphabets and invisible characters, which could
// otherwise pass as someone else's name.
const NAME_PATTERN = /^[A-Za-z0-9._-](?:[A-Za-z0-9._ -]{0,28}[A-Za-z0-9._-])?$/;
const NAME_HINT = "Use letters, numbers, spaces, dots, dashes or underscores.";

/** Account display names: 2 to 30 characters. */
export const displayNameSchema = z
  .string()
  .trim()
  .min(2, "At least 2 characters")
  .max(30, "30 characters max")
  .regex(NAME_PATTERN, NAME_HINT);

/** Names typed when posting as a guest: 1 to 30 characters. */
export const guestNameSchema = z
  .string()
  .trim()
  .min(1, "Add your name")
  .max(30, "30 characters max")
  .regex(NAME_PATTERN, NAME_HINT);
