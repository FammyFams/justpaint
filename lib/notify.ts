import "server-only";

// Emails the site owner, e.g. when a content report comes in. Sends through
// Resend (the same service that sends account emails) using RESEND_API_KEY;
// without that key it logs instead, so the report is still saved and shows
// up on /admin.
export async function notifyOwner(subject: string, text: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.REPORTS_EMAIL || "matthewzhenghi@gmail.com";
  if (!key) {
    console.warn("RESEND_API_KEY isn't set; report saved but no email sent:", subject);
    return false;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "justpaint <noreply@justpaint.art>",
        to: [to],
        subject,
        text,
      }),
    });
    if (!res.ok) console.error("report email failed", res.status, await res.text());
    return res.ok;
  } catch (error) {
    console.error("report email failed", error);
    return false;
  }
}
