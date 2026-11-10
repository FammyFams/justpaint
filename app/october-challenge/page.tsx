import { ChallengePage, challengeMetadata } from "@/components/challenge-page";
import { OCTOBER } from "@/lib/challenges";

export const metadata = challengeMetadata(OCTOBER);

// Cached and the same for everyone. The month is over, so nothing changes by
// date: entries added or removed still show right away (lib/revalidate.ts),
// and heart counts can wait.
export const revalidate = 2592000;

export default function OctoberChallengePage() {
  return <ChallengePage challenge={OCTOBER} />;
}
