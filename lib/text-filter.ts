import "server-only";

// W9: a word list checked on what people write (comments, painting titles and
// descriptions, display names, guest names, bios) by lib/writes before it's
// saved, for the website and the app alike. Existing posts aren't touched.
//
// Your call (2026-10-07): slurs and explicit sexual words only; ordinary
// swearing is allowed. Words with everyday art-community meanings are left
// out on purpose (pussy willow, blue tit, Moby Dick, nude studies, horny
// toad). Reports (/report) catch the rest.
//
// Matching ignores case and accents, reads common number-for-letter swaps
// (n1gg3r), stretched letters (niiigger), letters split by dots, dashes or
// spaces (n.i.g.g.e.r, n i g g e r), and "*" in place of a vowel (n*gger).
// It matches whole words, so Scunthorpe, snigger, grape, spicy, annals and
// therapist pass. Kept server-side so the list never ships to browsers.

// Whole words, plus endings: s, es, ed, er, ers, ing, z.
const WORDS = [
  // Racial and ethnic slurs
  "beaner", "coon", "darkie", "golliwog", "gook", "jigaboo", "kike", "kyke", "nigga",
  "nigger", "paki", "raghead", "redskin", "sambo", "sandnigger", "squaw", "towelhead",
  "wetback", "wog", "zipperhead",
  // Homophobic and transphobic slurs
  "dyke", "fag", "faggot", "poofter", "shemale", "trannie", "tranny",
  // Disability slurs
  "mongoloid", "retard", "spaz",
  // Explicit sexual words
  "anal", "bestiality", "bukkake", "creampie", "cum", "cumming", "cumshot", "cunt",
  "deepthroat", "dildo", "fap", "fapping", "hentai", "incest", "jizz", "milf",
  "onlyfans", "orgasm", "orgies", "orgy", "paedo", "paedophile", "pedo", "pedophile",
  "pedophilia", "rape", "raped", "raping", "rapist", "slut", "whore", "zoophilia",
];

// Whole words with no endings, since their endings make ordinary words
// (spicy, spices, japes, chinking).
const EXACT = ["chink", "chinks", "jap", "japs", "spic", "spics"];

// Also caught inside longer words (none of these hide in ordinary ones).
const ANYWHERE = ["blowjob", "gangbang", "handjob", "masturbat", "porn", "rimjob"];

const ENDINGS = "(?:s|es|ed|er|ers|ing|z)?";

const SWAPS: Record<string, string> = {
  "0": "o", "1": "i", "!": "i", "|": "i", "3": "e", "4": "a", "@": "a",
  "5": "s", "$": "s", "7": "t", "9": "g",
};

// A letter matches as written, or stretched to 3 or more ("niiigger", but
// "annals" isn't "anal"). A vowel after the first letter can be written "*"
// (so "f** off" or "***" isn't anything).
function letters(word: string): string {
  let first = true;
  return word.replace(/(.)\1*/g, (run, letter: string) => {
    const vowel = !first && "aeiouy".includes(letter);
    first = false;
    const one = vowel ? `[${letter}*]` : letter;
    return `(?:${one}{${run.length}}|${one}{${Math.max(3, run.length + 1)},})`;
  });
}

const whole = (word: string, endings = "") => `(?<![a-z*])${letters(word)}${endings}(?![a-z*])`;

const PATTERN = new RegExp(
  [
    ...WORDS.map((word) => whole(word, ENDINGS)),
    ...EXACT.map((word) => whole(word)),
    ...ANYWHERE.map(letters),
  ].join("|")
);

function normalize(text: string): string {
  let s = text.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase();
  // Number-for-letter swaps; "!" only mid-word, so "wow!" stays "wow".
  s = s.replace(/[0-9|@$]|!(?=[a-z])/g, (c) => SWAPS[c] ?? c);
  // Letters split by dots, dashes or underscores: "n.i.g" → "nig".
  s = s.replace(/([a-z*])[._-]+(?=[a-z*])/g, "$1");
  // Three or more letters spaced out one by one: "n i g g a" → "nigga".
  s = s.replace(/(?<![a-z*])[a-z*](?: [a-z*](?![a-z*])){2,}/g, (run) => run.replace(/ /g, ""));
  return s;
}

/** For display names and guest names. */
export const NAME_BLOCKED = "That name has a word we don't allow. Pick another.";

/** True when the text has a word from the list (see the top of this file). */
export function hasBlockedWord(text: string): boolean {
  return PATTERN.test(normalize(text));
}
