import "server-only";
import { revalidatePath } from "next/cache";
import { visitorKey } from "@/lib/client-ip";
import { notifyOwner } from "@/lib/notify";
import { getSiteUrl } from "@/lib/site-url";
import { createAdminClient } from "@/lib/supabase/admin";
import { REPORT_REASONS, paintingIdFrom, reportSchema } from "@/lib/validations/report";
import { fail, type WriteFailure } from "@/lib/writes/result";

// Reports, shared by the website's server action (app/actions/reports.ts) and
// the app API (app/api/app/v1/reports), so both follow the same rules.

const REPORTS_PER_HOUR = 5;
// Sitewide. Report emails share Resend's 100-a-day budget with sign-up and
// password reset emails, so a flood of reports from many IPs could otherwise
// use it all up. Reports past this are still saved and show on /admin.
const REPORT_EMAILS_PER_HOUR = 10;

/**
 * Anyone can report a post, with or without an account. Each report gets a
 * reference number, is saved for the record, and emails the site owner so
 * the 48-hour removal window (TAKE IT DOWN Act) can't slip by unnoticed.
 * Limits count per account when signed in, otherwise per IP.
 */
export async function submitReport(
  userId: string | null,
  // Checked here: the report form's fields (lib/validations/report.ts).
  values: unknown
): Promise<WriteFailure | { ok: true; reference: number }> {
  const parsed = reportSchema.safeParse(values);
  if (!parsed.success) {
    return fail("invalid", parsed.error.issues[0]?.message ?? "Check the form and try again.");
  }
  const { painting, reason, details, email, signature } = parsed.data;
  const paintingId = paintingIdFrom(painting)!;

  const admin = createAdminClient();
  const reporterHash = await visitorKey(userId);

  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await admin
    .from("content_reports")
    .select("id", { count: "exact", head: true })
    .eq("reporter_hash", reporterHash)
    .gt("created_at", since);
  if ((count ?? 0) >= REPORTS_PER_HOUR) {
    return fail(
      "rate_limited",
      `You've sent ${REPORTS_PER_HOUR} reports in the last hour. Try again later, or email thewcookie@gmail.com.`
    );
  }

  const { data: post } = await admin
    .from("paintings")
    .select("title")
    .eq("id", paintingId)
    .maybeSingle();
  if (!post) {
    return fail("not_found", "We couldn't find that post. It may already have been removed.");
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
    return fail(
      "busy",
      "The server is busy and couldn't send your report. Try again in a few minutes, or email thewcookie@gmail.com."
    );
  }

  // Includes this report. If the count fails, email anyway.
  const { count: sitewide } = await admin
    .from("content_reports")
    .select("id", { count: "exact", head: true })
    .gt("created_at", since);
  const reportsThisHour = sitewide ?? 0;

  if (reportsThisHour > REPORT_EMAILS_PER_HOUR) {
    console.warn(`report #${row.id} not emailed: ${reportsThisHour} reports in the last hour`);
  } else {
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
        reportsThisHour === REPORT_EMAILS_PER_HOUR
          ? `\nThat's ${REPORT_EMAILS_PER_HOUR} reports in the last hour. Any more this hour won't be emailed. Check ${getSiteUrl()}/admin for them.`
          : "",
      ].join("\n")
    );
  }

  revalidatePath("/admin");
  return { ok: true, reference: row.id };
}
