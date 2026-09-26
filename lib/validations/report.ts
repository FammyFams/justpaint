import * as z from "zod";

export const REPORT_REASONS = {
  intimate: "Intimate or sexual image of me (or someone I represent) shared without consent, including AI fakes",
  minor: "Sexual or exploitative content involving someone under 18",
  harassment: "Harassment, threats, or private information about someone",
  other: "Something else that breaks the rules",
} as const;

export type ReportReason = keyof typeof REPORT_REASONS;

const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

/** Pulls the painting id out of a pasted link (or a bare id). */
export function paintingIdFrom(value: string): string | null {
  return value.match(UUID)?.[0]?.toLowerCase() ?? null;
}

export const reportSchema = z.object({
  painting: z
    .string()
    .trim()
    .min(1, "Paste the link to the post.")
    .refine((v) => paintingIdFrom(v) !== null, "That doesn't look like a justpaint post link."),
  reason: z.enum(Object.keys(REPORT_REASONS) as [ReportReason, ...ReportReason[]], {
    error: "Pick a reason.",
  }),
  details: z.string().trim().max(1000, "Keep it under 1000 characters."),
  email: z.email("Enter an email we can reply to.").max(254),
  signature: z.string().trim().min(2, "Type your full name as your signature.").max(100),
  goodFaith: z.literal(true, {
    error: "Confirm the statement above to send the report.",
  }),
});

export type ReportFormValues = z.infer<typeof reportSchema>;
