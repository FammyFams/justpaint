import { ChallengePage, challengeMetadata } from "@/components/challenge-page";
import { NOVEMBER } from "@/lib/challenges";

export const metadata = challengeMetadata(NOVEMBER);

// Cached and the same for everyone. New entries show right away
// (lib/revalidate.ts); today's prompt turns over within an hour of
// midnight Pacific, or with the first entry after it.
export const revalidate = 3600;

export default function NovemberChallengePage() {
  return <ChallengePage challenge={NOVEMBER} />;
}
