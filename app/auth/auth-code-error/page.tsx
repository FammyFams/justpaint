import { ResendConfirmationForm } from "@/components/auth-form";

// Where an expired or already-used confirmation link lands (/auth/confirm).
// Signing up again stops at "That display name is taken" (the unconfirmed
// account already holds the name), so this sends a new link instead.
export default function AuthCodeErrorPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4 py-10 sm:px-6">
      <h1 className="text-center font-heading text-3xl italic leading-tight">
        That link didn&rsquo;t work.
      </h1>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        The confirmation link may have expired or already been used. Enter the
        email you signed up with and we&rsquo;ll send you a new one.
      </p>

      <div className="mt-8 rounded-sm border border-border/70 bg-card p-6 shadow-[0_1px_2px_rgba(0,0,34,0.06)]">
        <ResendConfirmationForm />
      </div>
    </main>
  );
}
