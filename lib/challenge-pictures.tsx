import { ImageResponse } from "next/og";
import { jakartaFonts } from "@/lib/og-fonts";
import {
  RULES,
  WEEKDAYS,
  calendarWeeks,
  challengePath,
  promptFor,
  type Challenge,
} from "@/lib/challenges";

// The pictures for each challenge page: its calendar (calendar.png) and its
// link preview card (opengraph-image.tsx).

const PAPER = "#fbf5f3";
const INK = "#000022";
const CRIMSON = "#c42847";
const ORANGE = "#e28413";
const MUTED = "#3d3d55";
const HAIRLINE = "rgba(0,0,34,0.18)";

const PAD = 48;
const COL = (1080 - PAD * 2) / 7;

/**
 * The challenge as a picture: rules plus the prompt calendar. Shown in place
 * of the calendar on phones (where 7 columns of text don't fit) and made to
 * be shared, so justpaint.art sits at the top and bottom. Portrait 1080x1350,
 * Instagram's post size.
 */
export async function calendarPicture(c: Challenge) {
  const fonts = await jakartaFonts();

  const introLine = { display: "flex", fontSize: 36, fontWeight: 800, letterSpacing: -1, lineHeight: 1.05 };

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
              {c.hashtag}
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
            {c.name}
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
          {calendarWeeks(c).map((week, w) => (
            <div
              key={w}
              style={{ display: "flex", flex: "1 1 0", borderBottom: `2px solid ${INK}` }}
            >
              {week.map((cell, i) => {
                if (cell.kind === "blank") {
                  return <div key={i} style={{ display: "flex", width: COL * cell.span }} />;
                }
                if (cell.kind === "intro") {
                  // The blanks before day 1 or after the last day carry one
                  // line about the challenge.
                  const rule = `2px solid ${INK}`;
                  return (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-end",
                        width: COL * cell.span,
                        padding: "0 16px 14px 12px",
                        ...(cell.side === "start" ? { borderRight: rule } : { borderLeft: rule }),
                      }}
                    >
                      <div style={introLine}>{`${c.prompts.length} prompts.`}</div>
                      <div style={{ ...introLine, color: MUTED }}>One painting a day.</div>
                    </div>
                  );
                }
                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      width: COL,
                      padding: "10px 6px 12px 12px",
                      background: cell.day === c.holiday ? ORANGE : "transparent",
                      borderLeft: cell.weekday === 0 ? "none" : `1px solid ${HAIRLINE}`,
                    }}
                  >
                    <div style={{ display: "flex", fontSize: 54, fontWeight: 800, letterSpacing: -2.5, lineHeight: 1 }}>
                      {`${cell.day}`}
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
                      {promptFor(c, cell.day) ?? ""}
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

/** The link preview card for a challenge page. Uses the site palette. */
export async function challengeCard(c: Challenge, size: { width: number; height: number }) {
  const title = { display: "flex", fontSize: 88, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2 };
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#fbf5f3",
          color: "#000022",
          padding: "72px 80px",
          fontFamily: "Jakarta",
        }}
      >
        <div style={{ display: "flex", fontSize: 32, fontStyle: "italic", fontWeight: 600 }}>justpaint</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={title}>{`${c.month} Painting`}</div>
          <div style={{ ...title, color: "#c42847" }}>{`Challenge ${c.year}`}</div>
          <div style={{ display: "flex", fontSize: 34, marginTop: 20, color: "#44445a" }}>
            {`${c.prompts.length} daily prompts. Paint one a day.`}
          </div>
        </div>
        {c.cardPrompts.length > 0 ? (
          <div style={{ display: "flex", gap: 14 }}>
            {c.cardPrompts.map((p, i) => (
              <div
                key={p}
                style={{
                  display: "flex",
                  padding: "10px 20px",
                  borderRadius: 999,
                  fontSize: 26,
                  background: i % 2 ? "#e28413" : "#c42847",
                  color: i % 2 ? "#000022" : "#ffffff",
                }}
              >
                {p}
              </div>
            ))}
          </div>
        ) : (
          // No prompts picked yet: the address instead.
          <div style={{ display: "flex", fontSize: 30, fontWeight: 600, color: "#44445a" }}>
            {`justpaint.art${challengePath(c)}`}
          </div>
        )}
      </div>
    ),
    { ...size, fonts: await jakartaFonts() }
  );
}
