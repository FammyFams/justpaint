import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/password-forms";
import { QueryNotice } from "@/components/address-query";

export const metadata: Metadata = {
  title: "Forgot password | justpaint",
  robots: { index: false, follow: true },
};

// Cached and the same for everyone; ?expired= is read in the browser.
export default function ForgotPasswordPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4 py-10 sm:px-6">
      <h1 className="text-center font-heading text-3xl italic leading-tight">
        Forgot your password?
      </h1>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        Enter the email you signed up with and we&rsquo;ll send you a link to pick a new one.
      </p>
      <QueryNotice param="expired">
        That reset link expired or was already used. Send yourself a new one.
      </QueryNotice>

      <div className="mt-8 rounded-sm border border-border/70 bg-card p-6 shadow-[0_1px_2px_rgba(0,0,34,0.06)]">
        <ForgotPasswordForm />
      </div>
    </main>
  );
}
