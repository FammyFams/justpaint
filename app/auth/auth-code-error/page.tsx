import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function AuthCodeErrorPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <h1 className="font-heading text-3xl italic leading-tight">
        That link didn&rsquo;t work.
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        The confirmation link may have expired or already been used. Try
        logging in, or sign up again to get a fresh one.
      </p>
      <div className="mt-6 flex gap-3">
        <Link href="/login" className={buttonVariants({ variant: "outline" })}>
          Log in
        </Link>
        <Link href="/signup" className={buttonVariants()}>
          Sign up
        </Link>
      </div>
    </main>
  );
}
