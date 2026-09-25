import type { Metadata } from "next";
import { UploadForm } from "@/components/upload-form";

export const metadata: Metadata = {
  title: "Upload a painting — justpaint",
};

export default function UploadPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="font-heading text-4xl italic leading-tight sm:text-5xl">
        Hang something new.
      </h1>
      <p className="mt-3 max-w-xl text-muted-foreground">
        A photo, a title, and a few words about it. That&rsquo;s the whole form.
      </p>

      <div className="mt-10">
        <UploadForm />
      </div>
    </main>
  );
}
