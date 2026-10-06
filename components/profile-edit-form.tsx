"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { profileSchema, type ProfileFormValues } from "@/lib/validations/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field";
import { updateProfileAction } from "@/app/actions/profile";
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

  async function onSubmit(values: ProfileFormValues) {
    setFormError(null);
    let result;
    try {
      result = await updateProfileAction(values);
    } catch {
      setFormError(
        "Couldn't reach the server. It may be busy, or your connection dropped. Try again in a few minutes."
      );
      return;
    }
    if ("error" in result) {
      setFormError(result.error);
      return;
    }
    toast.success("Profile updated.");
    // The address follows the name, so a new name means a new address.
    router.push(artistHref({ id: artist.id, displayName: values.displayName }));
    router.refresh();
    // The account menu shows the name too.
    refresh();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8" noValidate>
      <FieldGroup>
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
