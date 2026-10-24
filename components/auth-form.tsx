"use client";

import { useState } from "react";
import Link from "next/link";
import { unstable_rethrow } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  loginSchema,
  resendConfirmationSchema,
  signupSchema,
  type LoginFormValues,
  type ResendConfirmationFormValues,
  type SignupFormValues,
} from "@/lib/validations/auth";
import { resendConfirmationAction, signInAction, signUpAction } from "@/app/actions/auth";
import { nextFromAddress } from "@/components/address-query";

// The request itself failed: Vercel or Supabase is down or over a limit, or
// the visitor's connection dropped.
export const UNREACHABLE =
  "Couldn't reach the server. It may be busy, or your connection dropped. Try again in a few minutes.";

// "Didn't get it? Send it again": sends the confirmation link again to an
// email the visitor already typed, for one that expired or never came.
function ResendLink({
  email,
  prompt,
  label,
  onSent,
}: {
  email: string;
  prompt: string;
  label: string;
  onSent?: () => void;
}) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function resend() {
    // Ignored rather than disabled while sending: disabling the focused
    // button would drop keyboard focus to the top of the page.
    if (sending) return;
    setError(null);
    setSending(true);
    let result;
    try {
      result = await resendConfirmationAction({ email });
    } catch {
      result = { error: UNREACHABLE };
    }
    setSending(false);
    if ("error" in result) {
      setError(result.error);
      return;
    }
    setSent(true);
    onSent?.();
  }

  if (sent) {
    return (
      <p className="text-sm text-muted-foreground" role="status">
        We sent a new link to {email}. It can take a few minutes, so check your
        spam folder too.
      </p>
    );
  }

  return (
    <>
      <p className="text-sm text-muted-foreground">
        {prompt}{" "}
        <button
          type="button"
          onClick={resend}
          className="text-primary underline underline-offset-2"
        >
          {sending ? "Sending…" : label}
        </button>
      </p>
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </>
  );
}

function AuthShell({
  mode,
  formError,
  formNote,
  submitting,
  children,
}: {
  mode: "login" | "signup";
  formError: string | null;
  formNote?: React.ReactNode;
  submitting: boolean;
  children: React.ReactNode;
}) {
  return (
    <FieldGroup>
      {children}

      {formError && (
        <p className="text-sm text-destructive" role="alert">
          {formError}
        </p>
      )}
      {formNote}

      <Button type="submit" className="mt-2 w-full" disabled={submitting}>
        {submitting
          ? "Please wait…"
          : mode === "login"
            ? "Log in"
            : "Create account"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {mode === "login" ? (
          <>
            New here?{" "}
            <Link href="/signup" className="text-primary underline underline-offset-2">
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already painting here?{" "}
            <Link href="/login" className="text-primary underline underline-offset-2">
              Log in
            </Link>
          </>
        )}
      </p>
    </FieldGroup>
  );
}

export function LoginForm() {
  const [formError, setFormError] = useState<string | null>(null);
  // Set when the account's email isn't confirmed yet, to offer a new link.
  const [unconfirmedEmail, setUnconfirmedEmail] = useState<string | null>(null);
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginFormValues) {
    setFormError(null);
    setUnconfirmedEmail(null);
    let result;
    try {
      // Where to go afterwards (?next=); the server checks it again.
      result = await signInAction(values, nextFromAddress());
    } catch (error) {
      // A successful login redirects by throwing; let that through.
      unstable_rethrow(error);
      setFormError(UNREACHABLE);
      return;
    }
    if (result?.error) {
      setFormError(result.error);
      if (result.unconfirmed) setUnconfirmedEmail(values.email);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <AuthShell
        mode="login"
        formError={formError}
        formNote={
          unconfirmedEmail && (
            <ResendLink
              email={unconfirmedEmail}
              prompt="Link expired or never came?"
              label="Send a new one"
              onSent={() => setFormError(null)}
            />
          )
        }
        submitting={form.formState.isSubmitting}
      >
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                {...field}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <div className="flex items-baseline justify-between gap-2">
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                {...field}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </AuthShell>
    </form>
  );
}

export function SignupForm() {
  const [formError, setFormError] = useState<string | null>(null);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { displayName: "", email: "", password: "", agreedToTerms: false },
  });

  async function onSubmit(values: SignupFormValues) {
    setFormError(null);
    let result;
    try {
      result = await signUpAction(values);
    } catch (error) {
      unstable_rethrow(error);
      setFormError(UNREACHABLE);
      return;
    }
    if (result && "error" in result) {
      setFormError(result.error);
      return;
    }
    if (result?.needsConfirmation) {
      setNeedsConfirmation(true);
    }
  }

  if (needsConfirmation) {
    return (
      <div className="flex flex-col items-center gap-3 py-4 text-center" role="status">
        <MailCheck className="size-8 text-primary" />
        <p className="font-medium">Check your email</p>
        <p className="text-sm text-muted-foreground">
          We sent a confirmation link to {form.getValues("email")}. Click it
          to finish creating your account. It can take a few minutes, so check
          your spam folder too.
        </p>
        <ResendLink
          email={form.getValues("email")}
          prompt="Didn't get it?"
          label="Send it again"
        />
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <AuthShell
        mode="signup"
        formError={formError}
        submitting={form.formState.isSubmitting}
      >
        <Controller
          name="displayName"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="displayName">Display name</FieldLabel>
              <Input
                id="displayName"
                autoComplete="nickname"
                placeholder="Your name"
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
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                {...field}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="password">
                <span className="shrink-0">Password</span>
                <span className="font-normal text-muted-foreground">· At least 8 characters</span>
              </FieldLabel>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                {...field}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="agreedToTerms"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <label className="flex items-start gap-2.5 text-sm">
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  onBlur={field.onBlur}
                  aria-invalid={fieldState.invalid}
                  className="mt-0.5 size-4 shrink-0 accent-primary"
                />
                <span>
                  I&rsquo;m 13 or older and agree to the{" "}
                  <Link
                    href="/terms" prefetch={false}
                    target="_blank"
                    className="text-primary underline underline-offset-2"
                  >
                    Terms of Use
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy" prefetch={false}
                    target="_blank"
                    className="text-primary underline underline-offset-2"
                  >
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </AuthShell>
    </form>
  );
}

// On the "That link didn't work" page (/auth/auth-code-error): the visitor
// types the email they signed up with to get a new confirmation link.
export function ResendConfirmationForm() {
  const [formError, setFormError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const form = useForm<ResendConfirmationFormValues>({
    resolver: zodResolver(resendConfirmationSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: ResendConfirmationFormValues) {
    setFormError(null);
    let result;
    try {
      result = await resendConfirmationAction(values);
    } catch {
      setFormError(UNREACHABLE);
      return;
    }
    if ("error" in result) {
      setFormError(result.error);
      return;
    }
    setSentTo(values.email);
  }

  if (sentTo) {
    return (
      <div className="flex flex-col items-center gap-3 py-4 text-center" role="status">
        <MailCheck className="size-8 text-primary" />
        <p className="font-medium">Check your email</p>
        <p className="text-sm text-muted-foreground">
          If {sentTo} has an account that isn&rsquo;t confirmed yet, we sent it a
          new link. It can take a few minutes, so check your spam folder too.
        </p>
        <Link href="/login" className="mt-2 text-sm text-primary hover:underline">
          Back to log in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                {...field}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {formError && (
          <p className="text-sm text-destructive" role="alert">
            {formError}
          </p>
        )}

        <Button type="submit" className="mt-2 w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Please wait…" : "Send a new link"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Already confirmed?{" "}
          <Link href="/login" className="text-primary underline underline-offset-2">
            Log in
          </Link>
        </p>
      </FieldGroup>
    </form>
  );
}
