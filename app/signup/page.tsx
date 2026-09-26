import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SignupForm } from "@/components/auth-form";
import { getCurrentUser } from "@/lib/current-user";

export const metadata: Metadata = { title: "Sign up | justpaint" };

export default async function SignupPage() {
  if (await getCurrentUser()) redirect("/");

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4 py-10 sm:px-6">
      <h1 className="text-center font-heading text-3xl italic leading-tight">
        Join justpaint.
      </h1>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        Free. Comment on paintings and keep yours on a profile.
      </p>

      <div className="mt-8 rounded-sm border border-border/70 bg-card p-6 shadow-[0_1px_2px_rgba(0,0,34,0.06)]">
        <SignupForm />
      </div>
    </main>
  );
}
