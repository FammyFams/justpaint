import * as z from "zod";
import { displayNameSchema } from "@/lib/validations/names";

export const loginSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

const newPasswordSchema = z.string().min(8, "At least 8 characters").max(72, "72 characters max");

export const signupSchema = z.object({
  displayName: displayNameSchema,
  email: z.email("Enter a valid email"),
  password: newPasswordSchema,
  /** Covers both the 13+ age confirmation and the Terms agreement. */
  agreedToTerms: z
    .boolean()
    .refine((v) => v, "Confirm you're 13 or older and agree to the Terms of Use."),
});

export const forgotPasswordSchema = z.object({
  email: z.email("Enter a valid email"),
});

export const resetPasswordSchema = z
  .object({
    password: newPasswordSchema,
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "The passwords don't match",
    path: ["confirmPassword"],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type SignupFormValues = z.infer<typeof signupSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
