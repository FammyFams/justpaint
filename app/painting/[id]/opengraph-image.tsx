import { ImageResponse } from "next/og";
import { jakartaFonts } from "@/lib/og-fonts";
import { PAINTING_PICTURE_HEADERS, logoPicture, paintingPicture } from "@/lib/og-images";
import { getPaintingById } from "@/lib/paintings";
import { createPublicClient } from "@/lib/supabase/public";
import { PROMPTS } from "@/lib/october-challenge";

// The share preview for a painting. Sites like X and Facebook crop previews
// to about 2:1, which cut a portrait painting down to a thin strip, so the
// whole painting sits in a card on the left with its title on the right.
// Built on the first share and kept for 30 days; deleting the post clears it
// sooner (lib/delete-painting.ts), so a removed painting doesn't linger here.
export const dynamic = "force-static";
export const revalidate = 2592000; // matches PAINTING_PICTURE_HEADERS

export const alt = "A beginner painting shared on justpaint";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PAPER = "#fbf5f3";
const INK = "#000022";
const CRIMSON = "#c42847";
const MUTED = "#44445a";
const HAIRLINE = "rgba(0,0,34,0.14)";

const PAD = 40;
const MAT = 14;

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const painting = await getPaintingById(id, createPublicClient()).catch(() => null);
  const [fonts, logo, picture] = await Promise.all([
    jakartaFonts(),
    logoPicture(52),
    painting ? paintingPicture(painting.imageUrl, 620, size.height - PAD * 2 - MAT * 2) : null,
  ]);

  const title = painting?.title ?? "A painting on justpaint";
  const titleSize = title.length <= 22 ? 64 : title.length <= 44 ? 52 : 42;
  const day = painting?.octoberChallenge ? painting.octoberDay : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          gap: 48,
          padding: PAD,
          background: PAPER,
          color: INK,
          fontFamily: "Jakarta",
        }}
      >
        {picture && (
          <div
            style={{
              display: "flex",
              flexShrink: 0,
              padding: MAT,
              background: "#ffffff",
              border: `1px solid ${HAIRLINE}`,
              borderRadius: 4,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- next/og renders plain img */}
            <img src={picture.src} width={picture.width} height={picture.height} alt="" />
          </div>
        )}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            flex: 1,
            height: "100%",
            padding: "12px 0",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            {day && (
              <div
                style={{
                  display: "flex",
                  fontSize: 22,
                  fontWeight: 700,
                  letterSpacing: 2,
                  color: CRIMSON,
                  textTransform: "uppercase",
                  marginBottom: 18,
                }}
              >
                {`October ${day} · ${PROMPTS[day - 1]}`}
              </div>
            )}
            <div style={{ display: "flex", fontSize: titleSize, fontStyle: "italic", fontWeight: 600, lineHeight: 1.1 }}>
              {title}
            </div>
            {painting && (
              <div style={{ display: "flex", fontSize: 32, fontWeight: 500, marginTop: 20, color: MUTED }}>
                {`by ${painting.authorName}`}
              </div>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 28, fontWeight: 700 }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- next/og renders plain img */}
            <img
              src={logo.src}
              width={logo.width}
              height={logo.height}
              alt=""
              style={{ borderRadius: 999, border: `1px solid ${HAIRLINE}` }}
            />
            justpaint.art
          </div>
        </div>
      </div>
    ),
    { ...size, fonts, headers: PAINTING_PICTURE_HEADERS }
  );
}
