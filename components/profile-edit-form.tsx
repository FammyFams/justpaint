"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { profileSchema, type ProfileFormValues } from "@/lib/validations/profile";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES, MAX_IMAGE_LABEL } from "@/lib/validations/painting";
import { compressImage } from "@/lib/compress-image";
import { ArtistAvatar } from "@/components/artist-avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldDescription,
  FieldTitle,
} from "@/components/ui/field";
import { updateProfileAction } from "@/app/actions/profile";
import { removeAvatarAction, setAvatarAction } from "@/app/actions/avatar";
import type { Artist } from "@/lib/types";
import { artistHref } from "@/lib/artist-url";
import { useViewer } from "@/components/viewer";

export function ProfileEditForm({ artist }: { artist: Artist }) {
  const router = useRouter();
  const { refresh } = useViewer();
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { displayName: artist.displayName, bio: artist.bio },
  });
  const typedName = useWatch({ control: form.control, name: "displayName" });

  // The picture is saved with the rest of the form, on Save changes.
  const [savedAvatar, setSavedAvatar] = useState(artist.avatarUrl);
  const [picked, setPicked] = useState<{ file: File; preview: string } | null>(null);
  const [removing, setRemoving] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const shownAvatar = picked?.preview ?? (removing ? null : savedAvatar);

  async function onPick(event: React.ChangeEvent<HTMLInputElement>) {
    const input = event.target;
    const chosen = input.files?.[0];
    // Picking the same file again should still fire onChange.
    input.value = "";
    if (!chosen) return;
    setAvatarError(null);
    setPreparing(true);
    // The picture is shown at most 80 px wide, so 512 px is plenty to send;
    // the server makes the final 256 px square.
    const file = await compressImage(chosen, 512);
    setPreparing(false);
    if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
      setAvatarError("File must be a PNG, JPEG, WEBP, or GIF image.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setAvatarError(`That photo is over ${MAX_IMAGE_LABEL}. Try a smaller one.`);
      return;
    }
    if (picked) URL.revokeObjectURL(picked.preview);
    setPicked({ file, preview: URL.createObjectURL(file) });
    setRemoving(false);
  }

  function onRemove() {
    if (picked) URL.revokeObjectURL(picked.preview);
    setPicked(null);
    setAvatarError(null);
    setRemoving(true);
  }

  // Each save is its own request, so a failure partway keeps what already
  // went through and says what didn't.
  async function save(values: ProfileFormValues): Promise<string | null> {
    if (picked) {
      const result = await setAvatarAction(picked.file);
      if ("error" in result) return result.error;
      setSavedAvatar(result.avatarUrl);
      setPicked(null);
    } else if (removing) {
      const result = await removeAvatarAction();
      if ("error" in result) return result.error;
      setSavedAvatar(null);
      setRemoving(false);
    }

    // A name or bio save rebuilds cached pages (a new name, every page with
    // their posts or comments), so skip it when only the picture changed.
    if (values.displayName === artist.displayName && (values.bio ?? "") === artist.bio) {
      return null;
    }
    const result = await updateProfileAction(values);
    return "error" in result ? result.error : null;
  }

  async function onSubmit(values: ProfileFormValues) {
    setFormError(null);
    let error;
    try {
      error = await save(values);
    } catch {
      setFormError(
        "Couldn't reach the server. It may be busy, or your connection dropped. Try again in a few minutes."
      );
      return;
    }
    if (error) {
      setFormError(error);
      return;
    }
    toast.success("Profile updated.");
    // The address follows the name, so a new name means a new address.
    router.push(artistHref({ id: artist.id, displayName: values.displayName }));
    router.refresh();
    // The account menu shows the name and picture too.
    refresh();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8" noValidate>
      <FieldGroup>
        <Field data-invalid={Boolean(avatarError)}>
          <FieldTitle>Profile picture</FieldTitle>
          <div className="flex items-center gap-4">
            <ArtistAvatar
              name={typedName || artist.displayName}
              src={shownAvatar}
              className="size-20 text-lg"
            />
            <div className="flex flex-wrap items-center gap-2">
              {/* The real file input is invisible; this label is its button
                  and shows its keyboard focus. */}
              <label
                className={buttonVariants({
                  variant: "outline",
                  className:
                    "cursor-pointer has-focus-visible:border-ring has-focus-visible:ring-3 has-focus-visible:ring-ring/50",
                })}
              >
                {preparing ? "Preparing…" : shownAvatar ? "Change photo" : "Add a photo"}
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  disabled={preparing || form.formState.isSubmitting}
                  onChange={onPick}
                />
              </label>
              {shownAvatar && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onRemove}
                  disabled={form.formState.isSubmitting}
                >
                  Remove
                </Button>
              )}
            </div>
          </div>
          <FieldDescription>
            {picked || removing
              ? "Not saved yet. Press Save changes."
              : "Shown on your profile, your paintings and your comments. The middle of the photo is used."}
          </FieldDescription>
          {avatarError && <FieldError>{avatarError}</FieldError>}
        </Field>

        <Controller
          name="displayName"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="displayName">Display name</FieldLabel>
              <Input id="displayName" {...field} aria-invalid={fieldState.invalid} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="bio"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="bio">Bio</FieldLabel>
              <Textarea
                id="bio"
                rows={4}
                className="resize-none"
                {...field}
                aria-invalid={fieldState.invalid}
              />
              <FieldDescription>A line or two about what you paint.</FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {formError && (
          <p className="text-sm text-destructive" role="alert">
            {formError}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
