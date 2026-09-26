import * as z from "zod";
import { displayNameSchema } from "@/lib/validations/names";

export const profileSchema = z.object({
  displayName: displayNameSchema,
  bio: z.string().trim().max(280, "Keep it under 280 characters").optional(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
