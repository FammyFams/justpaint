import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ResetPasswordForm } from "@/components/password-forms";
import { getCurrentUser } from "@/lib/current-user";

export const metadata: Metadata = {
  title: "New password | justpaint",
  robots: { index: false, follow: false },
};

// The link in the reset email signs the person in through /auth/confirm and
// lands here. Without that session there's nothing to change.
export default async function ResetPasswordPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 text-center">
        <h1 className="font-heading text-3xl italic leading-tight">
          That link didn&rsquo;t work.
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Reset links expire and only work once. Send yourself a new one.
        </p>
        <div className="mt-6">
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/forgot-password">Send a new link</Link>}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4 py-10 sm:px-6">
      <h1 className="text-center font-heading text-3xl italic leading-tight">
        Pick a new password.
      </h1>
      {user.email && (
        <p className="mt-2 text-center text-sm text-muted-foreground">
          For {user.email}.
        </p>
      )}

      <div className="mt-8 rounded-sm border border-border/70 bg-card p-6 shadow-[0_1px_2px_rgba(0,0,34,0.06)]">
        <ResetPasswordForm />
      </div>
    </main>
  );
}
