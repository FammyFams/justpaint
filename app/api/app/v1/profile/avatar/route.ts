import { getBearerUserId } from "@/lib/api/auth";
import { apiError, failed, json, unauthorized } from "@/lib/api/respond";
import { removeAvatar, setAvatar } from "@/lib/writes/avatar";

// The signed-in user's profile picture, with the website's rules: a PNG, JPEG,
// WebP or GIF up to 4 MB, cropped to the middle square and saved as a 256 px
// WebP with no metadata. The old file is deleted either way.
//
// POST multipart/form-data: image (the file) → { avatarUrl }
export async function POST(request: Request) {
  const userId = await getBearerUserId(request);
  if (!userId) return unauthorized();

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return apiError(400, "invalid", "send the picture as multipart form data.");
  }

  // Checked by setAvatar: a missing or text field is "Choose a photo."
  const result = await setAvatar(userId, form.get("image"));
  if (!result.ok) return failed(result);
  return json({ avatarUrl: result.avatarUrl });
}

// Back to initials. → { avatarUrl: null }
export async function DELETE(request: Request) {
  const userId = await getBearerUserId(request);
  if (!userId) return unauthorized();

  const result = await removeAvatar(userId);
  if (!result.ok) return failed(result);
  return json({ avatarUrl: null });
}
