import { ImageResponse } from "next/og";
import { jakartaFonts } from "@/lib/og-fonts";

// The preview card shown when the challenge page is shared (iMessage,
// Instagram DMs, Discord, X...). Uses the site palette.
export const alt = "October Painting Challenge 2026 on justpaint: 31 daily painting prompts";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const SAMPLE_PROMPTS = ["Cow", "Orange leaf", "Pumpkin", "Happy frog", "Magic cat", "Candy corn"];

export default async function Image() {
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
          <div style={{ display: "flex", fontSize: 88, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2 }}>
            October Painting
          </div>
          <div style={{ display: "flex", fontSize: 88, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2, color: "#c42847" }}>
            Challenge 2026
          </div>
          <div style={{ display: "flex", fontSize: 34, marginTop: 20, color: "#44445a" }}>
            31 daily prompts. Paint one a day.
          </div>
        </div>
        <div style={{ display: "flex", gap: 14 }}>
          {SAMPLE_PROMPTS.map((p, i) => (
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
      </div>
    ),
    { ...size, fonts: await jakartaFonts() }
  );
}
