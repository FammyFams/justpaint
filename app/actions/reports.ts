"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdmin } from "@/lib/admin";
import { getSessionUserId } from "@/lib/current-user";
import { deletePaintingRecord } from "@/lib/delete-painting";
import { submitReport } from "@/lib/writes/reports";

// The rules (5 reports an hour, 10 report emails an hour sitewide) live in
// lib/writes/reports.ts, shared with the app's API.
export async function submitReportAction(
  values: unknown
): Promise<{ error: string } | { reference: number }> {
  const result = await submitReport(await getSessionUserId(), values);
  if (!result.ok) return { error: result.error };
  return { reference: result.reference };
}

/**
 * Admin decision on a report. "removed" deletes the post and every other post
 * with the identical image (same fingerprint), then closes the report and any
 * other open reports about those posts.
 */
export async function resolveReportAction(
  reportId: number,
  outcome: "removed" | "no_action"
): Promise<{ error: string } | { removed: number }> {
  if (!(await isAdmin())) return { error: "Not authorized." };
  if (!Number.isInteger(reportId) || !["removed", "no_action"].includes(outcome)) {
    return { error: "Unknown report." };
  }

  const admin = createAdminClient();
  const { data: report } = await admin
    .from("content_reports")
    .select("id, painting_id, status")
    .eq("id", reportId)
    .maybeSingle();
  if (!report) return { error: "Unknown report." };

  const removedIds: string[] = [];
  if (outcome === "removed" && report.painting_id) {
    const { data: post } = await admin
      .from("paintings")
      .select("id, image_sha256")
      .eq("id", report.painting_id)
      .maybeSingle();

    const ids = new Set<string>(post ? [post.id] : []);
    if (post?.image_sha256) {
      const { data: copies } = await admin
        .from("paintings")
        .select("id")
        .eq("image_sha256", post.image_sha256);
      for (const copy of copies ?? []) ids.add(copy.id);
    }

    for (const id of ids) {
      const result = await deletePaintingRecord(id, null);
      if ("success" in result) removedIds.push(id);
    }
    if (post && !removedIds.includes(post.id)) {
      return { error: "Couldn't remove the post. Try again." };
    }
  }

  const resolvedAt = new Date().toISOString();
  await admin
    .from("content_reports")
    .update({ status: outcome, resolved_at: resolvedAt, removed_count: removedIds.length })
    .eq("id", reportId);

  // Other open reports about posts that are now gone are settled too.
  if (removedIds.length > 0) {
    await admin
      .from("content_reports")
      .update({ status: "removed", resolved_at: resolvedAt })
      .eq("status", "open")
      .in("painting_id", removedIds);
  }

  revalidatePath("/admin");
  return { removed: removedIds.length };
}
