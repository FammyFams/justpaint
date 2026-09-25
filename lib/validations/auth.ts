import * as z from "zod";

export const loginSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const signupSchema = z.object({
  displayName: z.string().trim().min(2, "At least 2 characters").max(60),
  email: z.email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type SignupFormValues = z.infer<typeof signupSchema>;
