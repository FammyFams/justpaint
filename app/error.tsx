"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

// Shown when a page can't load its data, e.g. Supabase is down or the free
// plan's limits have been hit.
export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
      <h1 className="font-heading text-3xl italic leading-tight">The server is busy</h1>
      <p className="mt-3 text-muted-foreground">
        We can&apos;t load this page right now. Try again in a few minutes.
      </p>
      <Button className="mt-6" onClick={() => retry()}>
        Try again
      </Button>
    </main>
  );
}
