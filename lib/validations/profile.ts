import * as z from "zod";

export const profileSchema = z.object({
  displayName: z.string().trim().min(2, "At least 2 characters").max(60),
  bio: z.string().trim().max(280, "Keep it under 280 characters").optional(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
