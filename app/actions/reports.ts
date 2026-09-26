"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdmin } from "@/lib/admin";
import { visitorKey } from "@/lib/client-ip";
import { getSessionUserId } from "@/lib/current-user";
import { deletePaintingRecord } from "@/lib/delete-painting";
import { notifyOwner } from "@/lib/notify";
import { getSiteUrl } from "@/lib/site-url";
import { REPORT_REASONS, paintingIdFrom, reportSchema } from "@/lib/validations/report";

const REPORTS_PER_HOUR = 5;

/**
 * Anyone can report a post, with or without an account. Each report gets a
 * reference number, is saved for the record, and emails the site owner so
 * the 48-hour removal window (TAKE IT DOWN Act) can't slip by unnoticed.
 */
export async function submitReportAction(
  values: unknown
): Promise<{ error: string } | { reference: number }> {
  const parsed = reportSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  }
  const { painting, reason, details, email, signature } = parsed.data;
  const paintingId = paintingIdFrom(painting)!;

  const admin = createAdminClient();
  const reporterHash = await visitorKey(await getSessionUserId());

  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await admin
    .from("content_reports")
    .select("id", { count: "exact", head: true })
    .eq("reporter_hash", reporterHash)
    .gt("created_at", since);
  if ((count ?? 0) >= REPORTS_PER_HOUR) {
    return {
      error: `You've sent ${REPORTS_PER_HOUR} reports in the last hour. Try again later, or email matthewzhenghi@gmail.com.`,
    };
  }

  const { data: post } = await admin
    .from("paintings")
    .select("title")
    .eq("id", paintingId)
    .maybeSingle();
  if (!post) {
    return { error: "We couldn't find that post. It may already have been removed." };
  }

  const { data: row, error } = await admin
    .from("content_reports")
    .insert({
      painting_id: paintingId,
      painting_title: post.title,
      reason,
      details,
      contact_email: email,
      signature,
      reporter_hash: reporterHash,
    })
    .select("id, created_at")
    .single();
  if (error || !row) {
    console.error("report insert failed", error);
    return { error: "Couldn't send your report. Try again, or email matthewzhenghi@gmail.com." };
  }

  const deadline = new Date(new Date(row.created_at).getTime() + 48 * 60 * 60 * 1000);
  await notifyOwner(
    `justpaint report #${row.id}: ${reason === "intimate" || reason === "minor" ? "URGENT, " : ""}${post.title}`,
    [
      `Report #${row.id} came in for "${post.title}".`,
      ``,
      `Reason: ${REPORT_REASONS[reason]}`,
      `Details: ${details || "(none)"}`,
      `Reply to: ${email}`,
      `Signed: ${signature}`,
      ``,
      `Post: ${getSiteUrl()}/painting/${paintingId}`,
      `Review it at ${getSiteUrl()}/admin`,
      reason === "intimate" || reason === "minor"
        ? `\nIf the report is valid, the post must be removed by ${deadline.toUTCString()} (48 hours).`
        : "",
    ].join("\n")
  );

  revalidatePath("/admin");
  return { reference: row.id };
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
