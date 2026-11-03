import { challengeCard } from "@/lib/challenge-pictures";
import { OCTOBER } from "@/lib/challenges";

// The preview card shown when the challenge page is shared (iMessage,
// Instagram DMs, Discord, X...). Built in lib/challenge-pictures.tsx.
export const alt = "October Painting Challenge 2026 on justpaint: 31 daily painting prompts";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return challengeCard(OCTOBER, size);
}
