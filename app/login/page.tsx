import type { Metadata } from "next";
import { LoginForm } from "@/components/auth-form";

export const metadata: Metadata = { title: "Log in — justpaint" };

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4 py-10 sm:px-6">
      <h1 className="text-center font-heading text-3xl italic leading-tight">
        Welcome back.
      </h1>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        Log in to like, comment, and hang your own work.
      </p>

      <div className="mt-8 rounded-sm border border-border/70 bg-card p-6 shadow-[0_1px_2px_rgba(32,26,19,0.06)]">
        <LoginForm />
      </div>
    </main>
  );
}
