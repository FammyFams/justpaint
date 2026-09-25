import type { Metadata } from "next";
import { SignupForm } from "@/components/auth-form";

export const metadata: Metadata = { title: "Sign up — justpaint" };

export default function SignupPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4 py-10 sm:px-6">
      <h1 className="text-center font-heading text-3xl italic leading-tight">
        Hang your first piece.
      </h1>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        Free to join. Takes about a minute.
      </p>

      <div className="mt-8 rounded-sm border border-border/70 bg-card p-6 shadow-[0_1px_2px_rgba(32,26,19,0.06)]">
        <SignupForm />
      </div>
    </main>
  );
}
