import { getBearerUserId } from "@/lib/api/auth";
import { apiError, failed, json, unauthorized } from "@/lib/api/respond";
import { createPainting, type CreatePaintingInput } from "@/lib/writes/paintings";

// Posts a painting as the signed-in user, with the website's rules: 4 MB at
// most, re-encoded on the server (no GPS or other metadata survives), 5 posts
// per 16 hours. Vercel turns away any request over 4.5 MB before it gets
// here, so the app shrinks photos to 1600px first.
//
// multipart/form-data: image (the file), title, description, tags (one field
// per tag), aspect ("portrait" | "landscape" | "square"), agreedToTerms
// ("true"), octoberChallenge ("true" or left out), octoberDay ("1" to "31").
// → 201 { painting: { id } }
export async function POST(request: Request) {
  const userId = await getBearerUserId(request);
  if (!userId) return unauthorized();

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return apiError(400, "invalid", "send the painting as multipart form data.");
  }

  const text = (name: string) => {
    const value = form.get(name);
    return typeof value === "string" ? value : "";
  };
  const day = Number(text("octoberDay"));

  const result = await createPainting(userId, {
    // Checked by createPainting: a missing or text field is "Add an image."
    image: form.get("image") as File,
    title: text("title"),
    description: text("description"),
    tags: form.getAll("tags").filter((tag): tag is string => typeof tag === "string"),
    aspect: text("aspect") as CreatePaintingInput["aspect"],
    agreedToTerms: text("agreedToTerms") === "true",
    octoberChallenge: text("octoberChallenge") === "true",
    octoberDay: Number.isInteger(day) && day > 0 ? day : undefined,
  });
  if (!result.ok) return failed(result);
  return json({ painting: { id: result.paintingId } }, { status: 201 });
}
