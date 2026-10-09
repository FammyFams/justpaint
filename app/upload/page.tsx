import type { Metadata } from "next";
import { UploadForm } from "@/components/upload-form";
import { TodayMark } from "@/components/today-mark";
import { getAllTags } from "@/lib/paintings";

export const metadata: Metadata = {
  title: "Upload a painting | justpaint",
  description:
    "Share a painting you made today with the justpaint beginner painting community. Free, and no account needed.",
  alternates: { canonical: "/upload" },
  openGraph: {
    siteName: "justpaint",
    title: "Upload a painting | justpaint",
    description: "Share a painting you made today with the justpaint beginner painting community.",
  },
};

// Cached and the same for everyone; the form works out who's posting in the
// browser. Rebuilt hourly in case a tag is added.
export const revalidate = 3600;

export default async function UploadPage() {
  const tags = await getAllTags();

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="font-heading text-4xl italic leading-tight sm:text-5xl">
        Upload painting
      </h1>
      <p className="mt-3 max-w-xl text-muted-foreground">
        Let&apos;s see what you painted <TodayMark />. No previously done paintings.
      </p>

      <div className="mt-10">
        <UploadForm tags={tags} />
      </div>
    </main>
  );
}
