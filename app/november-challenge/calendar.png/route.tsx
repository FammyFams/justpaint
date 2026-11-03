import { calendarPicture } from "@/lib/challenge-pictures";
import { NOVEMBER } from "@/lib/challenges";

// The calendar as a picture (lib/challenge-pictures.tsx). Static, so it's
// built once and cached.
export const dynamic = "force-static";

export function GET() {
  return calendarPicture(NOVEMBER);
}
