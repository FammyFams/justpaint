import { challengeCard } from "@/lib/challenge-pictures";
import { NOVEMBER } from "@/lib/challenges";

// The preview card shown when the challenge page is shared (iMessage,
// Instagram DMs, Discord, X...). Built in lib/challenge-pictures.tsx.
export const alt = "November Painting Challenge 2026 on justpaint: 30 daily painting prompts";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return challengeCard(NOVEMBER, size);
}
