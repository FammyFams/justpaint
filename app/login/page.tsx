import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth-form";
import { getCurrentUser } from "@/lib/current-user";
import { safeNext } from "@/lib/safe-next";

export const metadata: Metadata = { title: "Log in | justpaint" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; confirmed?: string }>;
}) {
  const params = await searchParams;
  const next = safeNext(params.next);
  if (await getCurrentUser()) redirect(next);

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4 py-10 sm:px-6">
      <h1 className="text-center font-heading text-3xl italic leading-tight">
        Welcome back.
      </h1>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        Log in to comment and keep your paintings on your profile.
      </p>
      {params.confirmed && (
        <p className="mt-4 rounded-sm bg-secondary px-3 py-2 text-center text-sm" role="status">
          Your email is confirmed. Log in to get started.
        </p>
      )}

      <div className="mt-8 rounded-sm border border-border/70 bg-card p-6 shadow-[0_1px_2px_rgba(0,0,34,0.06)]">
        <LoginForm next={next} />
      </div>
    </main>
  );
}
