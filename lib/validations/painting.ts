import * as z from "zod";

export const paintingSchema = z.object({
  name: z.string().trim().min(1, "Add your name").max(60),
  title: z.string().trim().min(2, "Give it a title").max(80),
  description: z
    .string()
    .trim()
    .max(600, "Keep it under 600 characters")
    .optional(),
  tags: z.string().trim().max(200).optional(),
  image: z
    .instanceof(File, { message: "Add an image of your painting" })
    .refine((file) => file.size > 0, "Add an image of your painting")
    .refine(
      (file) => file.size <= 10 * 1024 * 1024,
      "Image must be 10MB or smaller"
    )
    .refine(
      (file) => file.type.startsWith("image/"),
      "File must be an image"
    ),
});

export type PaintingFormValues = z.infer<typeof paintingSchema>;
