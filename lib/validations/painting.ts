import * as z from "zod";
import { guestNameSchema } from "@/lib/validations/names";

export const ALLOWED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
] as const;

// Vercel rejects any request over 4.5 MB before it reaches our code, and the
// upload request also carries the title, description and other fields, so
// the photo itself is capped a little lower. The browser shrinks photos to
// well under this first (lib/compress-image.ts); the cap only matters when
// that step can't shrink one.
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
export const MAX_IMAGE_LABEL = "4 MB";

export const paintingSchema = z.object({
  name: z.union([z.literal(""), guestNameSchema]).optional(),
  title: z.string().trim().min(2, "Give it a title").max(80),
  description: z
    .string()
    .trim()
    .min(1, "Add a description")
    .max(600, "Keep it under 600 characters"),
  tags: z.array(z.string().max(30)).min(1, "Pick at least one tag").max(5, "Pick up to 5 tags"),
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
      (file) => file.size <= MAX_IMAGE_BYTES,
      `Photo must be ${MAX_IMAGE_LABEL} or smaller. Try a smaller photo or a screenshot of it.`
    )
    .refine(
      (file) => (ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type),
      "File must be a PNG, JPEG, WEBP, or GIF image"
    ),
});

export type PaintingFormValues = z.infer<typeof paintingSchema>;
