import type { ReactNode } from "react";

// "today" with a pale yellow marker swipe behind it, slightly tilted like a
// real highlighter. justpaint is for what you painted today, so the word gets
// marked wherever the site says it. Yellow, not crimson: crimson stays an
// accent for text, never a fill.
export function TodayMark({ children = "today" }: { children?: ReactNode }) {
  return (
    <span className="relative inline-block whitespace-nowrap">
      <span
        aria-hidden
        className="absolute -inset-x-1 top-[38%] bottom-[4%] -rotate-1 rounded-[2px] bg-[#ffe27a]/80"
      />
      <span className="relative">{children}</span>
    </span>
  );
}
