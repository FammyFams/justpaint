"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  REPORT_REASONS,
  reportSchema,
  type ReportFormValues,
  type ReportReason,
} from "@/lib/validations/report";
import { submitReportAction } from "@/app/actions/reports";

export function ReportForm({ paintingLink }: { paintingLink?: string }) {
  const [formError, setFormError] = useState<string | null>(null);
  const [reference, setReference] = useState<number | null>(null);
  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      painting: paintingLink ?? "",
      details: "",
      email: "",
      signature: "",
      goodFaith: false as unknown as true,
    },
  });

  async function onSubmit(values: ReportFormValues) {
    setFormError(null);
    try {
      const result = await submitReportAction(values);
      if ("error" in result) {
        setFormError(result.error);
        return;
      }
      setReference(result.reference);
    } catch {
      setFormError("Couldn't send your report. Try again, or email matthewzhenghi@gmail.com.");
    }
  }

  if (reference !== null) {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center" role="status">
        <CircleCheck className="size-8 text-primary" />
        <p className="font-medium">Report received. Your reference number is #{reference}.</p>
        <p className="max-w-md text-sm text-muted-foreground">
          We&rsquo;ll review it and, if it breaks the rules, remove the post and any identical
          copies within 48 hours. We may email you if we need more information. Keep your
          reference number if you want to follow up.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        <Controller
          name="painting"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="painting">Link to the post</FieldLabel>
              <Input
                id="painting"
                placeholder="https://justpaint.art/painting/..."
                {...field}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="reason"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>What&rsquo;s wrong with it?</FieldLabel>
              <div className="flex flex-col gap-2" role="radiogroup">
                {(Object.keys(REPORT_REASONS) as ReportReason[]).map((key) => (
                  <label key={key} className="flex items-start gap-2.5 text-sm">
                    <input
                      type="radio"
                      name="reason"
                      value={key}
                      checked={field.value === key}
                      onChange={() => field.onChange(key)}
                      className="mt-0.5 size-4 shrink-0 accent-primary"
                    />
                    <span>{REPORT_REASONS[key]}</span>
                  </label>
                ))}
              </div>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="details"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="details">
                <span className="shrink-0">Anything we should know</span>
                <span className="font-normal text-muted-foreground">· Optional</span>
              </FieldLabel>
              <Textarea
                id="details"
                rows={3}
                maxLength={1000}
                placeholder="For example: who is in the image, or where else it was posted."
                className="resize-none"
                {...field}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="email">
                <span className="shrink-0">Your email</span>
                <span className="font-normal text-muted-foreground">
                  · Only used to follow up on this report
                </span>
              </FieldLabel>
              <Input id="email" type="email" {...field} aria-invalid={fieldState.invalid} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="signature"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="signature">
                <span className="shrink-0">Signature</span>
                <span className="font-normal text-muted-foreground">· Type your full name</span>
              </FieldLabel>
              <Input id="signature" {...field} aria-invalid={fieldState.invalid} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="goodFaith"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <label className="flex items-start gap-2.5 text-sm">
                <input
                  type="checkbox"
                  checked={field.value === true}
                  onChange={(e) => field.onChange(e.target.checked)}
                  onBlur={field.onBlur}
                  aria-invalid={fieldState.invalid}
                  className="mt-0.5 size-4 shrink-0 accent-primary"
                />
                <span>
                  I believe in good faith that this post breaks the rules (for an intimate
                  image: that it was shared without the consent of the person shown), and the
                  information in this report is accurate.
                </span>
              </label>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {formError && (
          <p className="text-sm text-destructive" role="alert">
            {formError}
          </p>
        )}

        <div className="flex justify-end">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Sending…" : "Send report"}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
