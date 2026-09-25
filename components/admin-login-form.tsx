"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { adminLoginAction } from "@/app/actions/admin";

export function AdminLoginForm() {
  const [state, formAction, pending] = useActionState(adminLoginAction, null);

  return (
    <form action={formAction} className="mt-6 flex max-w-sm flex-col gap-4">
      <Field data-invalid={Boolean(state?.error)}>
        <FieldLabel htmlFor="password">Admin password</FieldLabel>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          aria-invalid={Boolean(state?.error)}
        />
        {state?.error && <FieldError>{state.error}</FieldError>}
      </Field>
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Checking…" : "Log in"}
      </Button>
    </form>
  );
}
