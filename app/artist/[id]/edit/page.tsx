"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { getArtistById } from "@/lib/mock-data";
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

export default function EditProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const artist = getArtistById(id);
  if (!artist) notFound();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { displayName: artist.displayName, bio: artist.bio },
  });

  function onSubmit(values: ProfileFormValues) {
    toast.success("Profile updated locally — not saved yet.", {
      description: "Account persistence lands once the backend is wired up.",
    });
    console.log("profile update (not persisted)", values);
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="font-heading text-3xl italic leading-tight">
        Edit profile
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Changes here are local to your browser for now — nothing is saved to
        an account yet.
      </p>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mt-8"
        noValidate
      >
        <FieldGroup>
          <Controller
            name="displayName"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="displayName">Display name</FieldLabel>
                <Input
                  id="displayName"
                  {...field}
                  aria-invalid={fieldState.invalid}
                />
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
                <FieldDescription>
                  A line or two about what you paint.
                </FieldDescription>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <div className="flex justify-end gap-2">
            <Button type="submit">Save changes</Button>
          </div>
        </FieldGroup>
      </form>
    </main>
  );
}
