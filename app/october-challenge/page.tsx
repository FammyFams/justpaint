import { ChallengePage, challengeMetadata } from "@/components/challenge-page";
import { OCTOBER } from "@/lib/challenges";

export const metadata = challengeMetadata(OCTOBER);

// Cached and the same for everyone. New entries show right away
// (lib/revalidate.ts); today's prompt turns over within an hour of
// midnight Pacific, or with the first entry after it.
export const revalidate = 3600;

export default function OctoberChallengePage() {
  return <ChallengePage challenge={OCTOBER} />;
}
