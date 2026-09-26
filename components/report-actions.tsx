"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { resolveReportAction } from "@/app/actions/reports";

export function ReportActions({ reportId }: { reportId: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function resolve(outcome: "removed" | "no_action") {
    if (
      outcome === "removed" &&
      !window.confirm("Remove this post and any identical copies? This can't be undone.")
    ) {
      return;
    }
    setBusy(true);
    try {
      const result = await resolveReportAction(reportId, outcome);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success(
        outcome === "removed"
          ? `Removed ${result.removed} ${result.removed === 1 ? "post" : "posts"}.`
          : "Closed with no action."
      );
      router.refresh();
    } catch {
      toast.error("Couldn't save that. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button size="sm" variant="destructive" disabled={busy} onClick={() => resolve("removed")}>
        Remove post + copies
      </Button>
      <Button size="sm" variant="outline" disabled={busy} onClick={() => resolve("no_action")}>
        No action
      </Button>
    </div>
  );
}
