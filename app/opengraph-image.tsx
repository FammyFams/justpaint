import { ImageResponse } from "next/og";
import { jakartaFonts } from "@/lib/og-fonts";

// Default share preview for every page without its own (the challenge page
// and paintings have their own). Uses the site palette.
export const alt = "justpaint, a painting community for beginners";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "#fbf5f3",
          color: "#000022",
          padding: "72px 80px",
          fontFamily: "Jakarta",
        }}
      >
        <div style={{ display: "flex", fontSize: 120, fontStyle: "italic", fontWeight: 600, lineHeight: 1 }}>
          JUST PAINT
        </div>
        <div style={{ display: "flex", fontSize: 44, fontWeight: 700, marginTop: 28, color: "#c42847" }}>
          A painting community for beginners
        </div>
        <div style={{ display: "flex", fontSize: 34, marginTop: 16, color: "#44445a" }}>
          What did you paint today? Share it at justpaint.art
        </div>
      </div>
    ),
    { ...size, fonts: await jakartaFonts() }
  );
}
