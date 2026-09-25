import type { Metadata } from "next";
import { UploadForm } from "@/components/upload-form";
import { getAllTags } from "@/lib/paintings";

export const metadata: Metadata = {
  title: "Upload a painting | justpaint",
};

// Accounts are temporarily disabled -- everyone posts as a guest for now.
// Swap this back to `await getCurrentUser()` to bring accounts back.
const currentUser = null;

export default async function UploadPage() {
  const tags = await getAllTags();

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="font-heading text-4xl italic leading-tight sm:text-5xl">
        Upload painting
      </h1>
      <p className="mt-3 max-w-xl text-muted-foreground">
        Let&apos;s see what you painted today. No previously done paintings.
      </p>

      <div className="mt-10">
        <UploadForm currentUser={currentUser} tags={tags} />
      </div>
    </main>
  );
}
