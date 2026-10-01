import { ImageResponse } from "next/og";
import { jakartaFonts } from "@/lib/og-fonts";
import {
  CHALLENGE_NAME,
  FIRST_WEEKDAY,
  HASHTAG,
  PROMPTS,
  RULES,
  WEEKDAYS,
} from "@/lib/october-challenge";

// The challenge as a picture: rules plus the prompt calendar. Shown in place
// of the calendar on phones (where 7 columns of text don't fit) and made to
// be shared, so justpaint.art sits at the top and bottom. Portrait 1080x1350,
// Instagram's post size. Static, so it's built once and cached.
export const dynamic = "force-static";

const PAPER = "#fbf5f3";
const INK = "#000022";
const CRIMSON = "#c42847";
const ORANGE = "#e28413";
const MUTED = "#3d3d55";
const HAIRLINE = "rgba(0,0,34,0.18)";

const PAD = 48;
const COL = (1080 - PAD * 2) / 7;

export async function GET() {
  const fonts = await jakartaFonts();

  // Leading blanks (Oct 1 is a Thursday), then the 31 days, in weeks of 7.
  const cells: (number | null)[] = [
    ...Array.from({ length: FIRST_WEEKDAY }, () => null),
    ...PROMPTS.map((_, i) => i + 1),
  ];
  while (cells.length % 7) cells.push(null);
  const weeks = Array.from({ length: cells.length / 7 }, (_, w) => cells.slice(w * 7, w * 7 + 7));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: PAPER,
          color: INK,
          fontFamily: "Jakarta",
        }}
      >
        {/* Header: site, title, rules */}
        <div style={{ display: "flex", flexDirection: "column", padding: `44px ${PAD}px 0` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div
              style={{
                display: "flex",
                background: CRIMSON,
                color: "#ffffff",
                fontSize: 34,
                fontWeight: 800,
                padding: "8px 22px",
                borderRadius: 999,
              }}
            >
              justpaint.art
            </div>
            <div style={{ display: "flex", fontSize: 28, fontWeight: 800, color: CRIMSON }}>
              {HASHTAG}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 56,
              fontWeight: 800,
              letterSpacing: -2,
              marginTop: 18,
              lineHeight: 1.05,
            }}
          >
            {CHALLENGE_NAME}
          </div>
          <div style={{ display: "flex", flexDirection: "column", marginTop: 14 }}>
            {RULES.map((rule, i) => (
              <div key={rule} style={{ display: "flex", fontSize: 24, fontWeight: 500, lineHeight: 1.45 }}>
                <span style={{ color: CRIMSON, fontWeight: 800, width: 32 }}>{i + 1}.</span>
                {rule}
              </div>
            ))}
          </div>
        </div>

        {/* Weekday header */}
        <div
          style={{
            display: "flex",
            margin: `24px ${PAD}px 0`,
            borderBottom: `6px solid ${INK}`,
          }}
        >
          {WEEKDAYS.map((d) => (
            <div
              key={d}
              style={{
                display: "flex",
                width: COL,
                paddingLeft: 12,
                paddingBottom: 8,
                fontSize: 22,
                fontWeight: 800,
                letterSpacing: 1.5,
              }}
            >
              {d.toUpperCase()}
            </div>
          ))}
        </div>

        {/* Calendar: big scannable day numbers, prompts on a shared baseline */}
        <div style={{ display: "flex", flexDirection: "column", flexGrow: 1, margin: `0 ${PAD}px` }}>
          {weeks.map((week, w) => (
            <div
              key={w}
              style={{ display: "flex", flex: "1 1 0", borderBottom: `2px solid ${INK}` }}
            >
              {week.map((day, c) => {
                if (day === null) {
                  // The leading blanks carry one line about the challenge.
                  if (w === 0 && c === 0) {
                    return (
                      <div
                        key={c}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "flex-end",
                          width: COL * FIRST_WEEKDAY,
                          padding: "0 16px 14px 12px",
                          borderRight: `2px solid ${INK}`,
                        }}
                      >
                        <div style={{ display: "flex", fontSize: 36, fontWeight: 800, letterSpacing: -1, lineHeight: 1.05 }}>
                          31 prompts.
                        </div>
                        <div
                          style={{
                            display: "flex",
                            fontSize: 36,
                            fontWeight: 800,
                            letterSpacing: -1,
                            lineHeight: 1.05,
                            color: MUTED,
                          }}
                        >
                          One painting a day.
                        </div>
                      </div>
                    );
                  }
                  if (w === 0) return null;
                  return <div key={c} style={{ display: "flex", width: COL }} />;
                }
                const halloween = day === PROMPTS.length;
                return (
                  <div
                    key={c}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      width: COL,
                      padding: "10px 6px 12px 12px",
                      background: halloween ? ORANGE : "transparent",
                      borderLeft: c === 0 ? "none" : `1px solid ${HAIRLINE}`,
                    }}
                  >
                    <div style={{ display: "flex", fontSize: 54, fontWeight: 800, letterSpacing: -2.5, lineHeight: 1 }}>
                      {`${day}`}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        marginTop: "auto",
                        fontSize: 21,
                        fontWeight: 700,
                        lineHeight: 1.12,
                        letterSpacing: -0.5,
                      }}
                    >
                      {PROMPTS[day - 1]}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: 26,
            height: 96,
            background: CRIMSON,
            color: "#ffffff",
            fontSize: 40,
            fontWeight: 700,
          }}
        >
          Post yours at&nbsp;<span style={{ fontWeight: 800 }}>justpaint.art</span>
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1350,
      fonts,
    }
  );
}
