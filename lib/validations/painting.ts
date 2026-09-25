import * as z from "zod";

export const ALLOWED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
] as const;

export const paintingSchema = z.object({
  name: z.string().trim().max(60).optional(),
  title: z.string().trim().min(2, "Give it a title").max(80),
  description: z
    .string()
    .trim()
    .min(1, "Add a description")
    .max(600, "Keep it under 600 characters"),
  tags: z.array(z.string()).min(1, "Pick at least one tag"),
  agreedToTerms: z
    .boolean()
    .refine(
      (v) => v,
      "Confirm you're 13 or older and agree to the Terms of Use"
    ),
  image: z
    .instanceof(File, { message: "Add an image of your painting" })
    .refine((file) => file.size > 0, "Add an image of your painting")
    .refine(
      (file) => file.size <= 10 * 1024 * 1024,
      "Image must be 10MB or smaller"
    )
    .refine(
      (file) => (ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type),
      "File must be a PNG, JPEG, WEBP, or GIF image"
    ),
});

export type PaintingFormValues = z.infer<typeof paintingSchema>;
