import type { Metadata } from "next";
import { LoginForm } from "@/components/auth-form";
import { QueryNotice, RedirectIfSignedIn } from "@/components/address-query";

export const metadata: Metadata = {
  title: "Log in | justpaint",
  robots: { index: false, follow: true },
};

// Cached and the same for everyone: ?next=, ?confirmed= and "already signed
// in" are handled in the browser.
export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4 py-10 sm:px-6">
      <RedirectIfSignedIn />
      <h1 className="text-center font-heading text-3xl italic leading-tight">
        Welcome back.
      </h1>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        Log in to comment and keep your paintings on your profile.
      </p>
      <QueryNotice param="confirmed">Your email is confirmed. Log in to get started.</QueryNotice>

      <div className="mt-8 rounded-sm border border-border/70 bg-card p-6 shadow-[0_1px_2px_rgba(0,0,34,0.06)]">
        <LoginForm />
      </div>
    </main>
  );
}
