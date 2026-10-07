import { getBearerUserId } from "@/lib/api/auth";
import { failed, json, readJson } from "@/lib/api/respond";
import { submitReport } from "@/lib/writes/reports";

// Reports a painting, signed in or not, with the website's rules (5 reports an
// hour per account or IP; lib/writes/reports.ts). Body: the /report form's
// fields, { painting, reason, details, email, signature, goodFaith: true },
// where painting is the post's id or link and reason is one of intimate, minor,
// harassment or other (lib/validations/report.ts). → 201 { reference }.
export async function POST(request: Request) {
  // A token is optional: it only makes the limit count per account.
  const userId = await getBearerUserId(request);

  const result = await submitReport(userId, await readJson(request));
  if (!result.ok) return failed(result);
  return json({ reference: result.reference }, { status: 201 });
}
