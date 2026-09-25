"use client";

import { useState } from "react";
import Image from "next/image";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ImagePlus } from "lucide-react";
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
import {
  paintingSchema,
  type PaintingFormValues,
} from "@/lib/validations/painting";

export function UploadForm() {
  const [preview, setPreview] = useState<string | null>(null);

  const form = useForm<PaintingFormValues>({
    resolver: zodResolver(paintingSchema),
    defaultValues: { title: "", description: "", tags: "" },
  });

  function onSubmit(values: PaintingFormValues) {
    toast.success("Painting captured — not posted yet.", {
      description:
        "Uploads aren't wired to a backend in this preview. Nothing was saved.",
    });
    console.log("painting upload (not persisted)", values);
    form.reset({ title: "", description: "", tags: "" });
    setPreview(null);
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1.2fr]">
        <Controller
          name="image"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="image">Image</FieldLabel>
              <label
                htmlFor="image"
                className="group relative flex aspect-[4/5] w-full cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-sm border border-dashed border-border bg-card text-center transition-colors hover:border-primary/60"
              >
                {preview ? (
                  <Image
                    src={preview}
                    alt="Preview of your painting"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <>
                    <ImagePlus className="size-8 text-muted-foreground transition-colors group-hover:text-primary" />
                    <span className="px-6 text-sm text-muted-foreground">
                      Click to choose a photo of your painting
                    </span>
                  </>
                )}
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    field.onChange(file);
                    if (file) {
                      setPreview(URL.createObjectURL(file));
                    } else {
                      setPreview(null);
                    }
                  }}
                />
              </label>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <FieldGroup>
          <Controller
            name="title"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="title">Title</FieldLabel>
                <Input
                  id="title"
                  placeholder="Untitled"
                  {...field}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="description"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="description">Description</FieldLabel>
                <Textarea
                  id="description"
                  rows={5}
                  placeholder="Materials, process, what you were thinking about..."
                  className="resize-none"
                  {...field}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="tags"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="tags">Tags</FieldLabel>
                <Input
                  id="tags"
                  placeholder="oil, landscape, abstract"
                  {...field}
                  aria-invalid={fieldState.invalid}
                />
                <FieldDescription>Comma-separated.</FieldDescription>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <div className="flex justify-end">
            <Button type="submit">Post painting</Button>
          </div>
        </FieldGroup>
      </div>
    </form>
  );
}
