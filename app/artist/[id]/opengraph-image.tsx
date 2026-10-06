import { ImageResponse } from "next/og";
import { jakartaFonts } from "@/lib/og-fonts";
import { SHARE_PICTURE_HEADERS, logoPicture, paintingPicture, type OgPicture } from "@/lib/og-images";
import { findArtist, getPaintingsByArtist } from "@/lib/paintings";
import { createPublicClient } from "@/lib/supabase/public";

// The share preview for a profile: the name, how many paintings, and the
// latest three. Built on the first share and kept for an hour.
export const dynamic = "force-static";
export const revalidate = 86400; // matches SHARE_PICTURE_HEADERS

export const alt = "Paintings by an artist on justpaint";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PAPER = "#fbf5f3";
const INK = "#000022";
const CRIMSON = "#c42847";
const MUTED = "#44445a";
const HAIRLINE = "rgba(0,0,34,0.14)";

const PAD = 48;
const MAT = 10;
const GAP = 16;
// Room for the paintings on the right, and their tallest height.
const ROW_WIDTH = 620;
const ROW_HEIGHT = 420;

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = createPublicClient();
  const artist = await findArtist(id, client).catch(() => null);
  const paintings = artist ? await getPaintingsByArtist(artist.id, client).catch(() => []) : [];
  const latest = paintings.slice(0, 3);

  const [fonts, logo, ...loaded] = await Promise.all([
    jakartaFonts(),
    logoPicture(52),
    ...latest.map((p) => paintingPicture(p.imageUrl, ROW_WIDTH, ROW_HEIGHT)),
  ]);
  const pictures = loaded.filter((p): p is OgPicture => Boolean(p));
  // One height for the whole row, as tall as fits: the widths at that height
  // plus the gaps and mats fill ROW_WIDTH, and never taller than ROW_HEIGHT.
  const ratios = pictures.reduce((sum, p) => sum + p.width / p.height, 0);
  const free = ROW_WIDTH - GAP * (pictures.length - 1) - MAT * 2 * pictures.length;
  const height = Math.floor(Math.min(ROW_HEIGHT, free / Math.max(ratios, 0.01)));

  const name = artist?.displayName ?? "An artist on justpaint";
  // Names are often one long word, which can't wrap, so the size follows the
  // length to keep it inside the text column (about 440px).
  const nameSize = Math.max(36, Math.min(84, Math.floor(440 / (0.62 * name.length))));
  const count = paintings.length;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          gap: 40,
          padding: PAD,
          background: PAPER,
          color: INK,
          fontFamily: "Jakarta",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            flex: 1,
            height: "100%",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: 2,
                color: CRIMSON,
                textTransform: "uppercase",
                marginBottom: 14,
              }}
            >
              Paintings by
            </div>
            <div
              style={{
                display: "flex",
                fontSize: nameSize,
                fontStyle: "italic",
                fontWeight: 600,
                lineHeight: 1.05,
                wordBreak: "break-word",
              }}
            >
              {name}
            </div>
            {count > 0 && (
              <div style={{ display: "flex", fontSize: 30, fontWeight: 500, marginTop: 20, color: MUTED }}>
                {count === 1 ? "1 painting on justpaint" : `${count} paintings on justpaint`}
              </div>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 26, fontWeight: 700 }}>
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

        {pictures.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: GAP, flexShrink: 0 }}>
            {pictures.map((p, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  padding: MAT,
                  background: "#ffffff",
                  border: `1px solid ${HAIRLINE}`,
                  borderRadius: 4,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- next/og renders plain img */}
                <img
                  src={p.src}
                  width={Math.round((p.width * height) / p.height)}
                  height={height}
                  alt=""
                />
              </div>
            ))}
          </div>
        )}
      </div>
    ),
    { ...size, fonts, headers: SHARE_PICTURE_HEADERS }
  );
}
