import * as z from "zod";
import { displayNameSchema } from "@/lib/validations/names";

export const loginSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const signupSchema = z.object({
  displayName: displayNameSchema,
  email: z.email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters").max(72, "72 characters max"),
  /** Covers both the 13+ age confirmation and the Terms agreement. */
  agreedToTerms: z
    .boolean()
    .refine((v) => v, "Confirm you're 13 or older and agree to the Terms of Use."),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type SignupFormValues = z.infer<typeof signupSchema>;
