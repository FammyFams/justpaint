import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Support | justpaint",
  description: "Help with justpaint and the justPaint Art app: contact, posting limits, deleting a painting or your account, reporting and blocking.",
  alternates: { canonical: "/support" },
};

const EMAIL = "thewcookie@gmail.com";
const link = "text-primary underline underline-offset-2";

export default function SupportPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="font-heading text-4xl italic leading-tight sm:text-5xl">
        Support
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        For justpaint.art and the justPaint Art app
      </p>

      <div className="prose-content mt-10 flex flex-col gap-8 text-sm leading-relaxed text-foreground/90">
        <section>
          <h2 className="mb-2 font-heading text-xl">Contact us</h2>
          <p className="mb-2">
            Email{" "}
            <a href={`mailto:${EMAIL}?subject=justpaint%20help`} className={link}>
              {EMAIL}
            </a>{" "}
            and we&rsquo;ll get back to you. It helps to include:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>what you were trying to do, and what happened instead</li>
            <li>the page or screen, or a link to the painting</li>
            <li>your display name, if you have an account</li>
            <li>for the app: iPhone or Android, and a screenshot if you can</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 font-heading text-xl">
            Do the website and the app share an account?
          </h2>
          <p>
            Yes. Sign in to the app with the same email and password you use on
            justpaint.art. Your paintings, hearts and comments are the same in
            both.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-heading text-xl">How often can I post?</h2>
          <p>
            Up to 5 paintings every 16 hours. justpaint is for what you painted
            today, so come back when you&rsquo;ve painted something new. If you
            comment a lot in a short time, you&rsquo;ll be asked to take a short
            break.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-heading text-xl">
            It says the server is busy
          </h2>
          <p>
            justpaint runs on free plans that have limits. When one is reached,
            posting or loading can pause for a while. Try again in a few minutes.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-heading text-xl">How do I delete a painting?</h2>
          <p>
            Open your painting while signed in. On the website, use Delete; in
            the app, scroll down and tap delete painting. Its hearts and comments
            go with it. For a painting you posted as a guest, email us its link.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-heading text-xl">
            How do I change my name, bio or picture?
          </h2>
          <p>
            On the website, open your profile and choose Edit profile. In the
            app, go to Profile, then settings, to change your name and bio. Your
            picture can be changed on the website.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-heading text-xl">I forgot my password</h2>
          <p>
            Choose Forgot password on the{" "}
            <Link href="/login" prefetch={false} className={link}>
              log in page
            </Link>{" "}
            or &ldquo;forgot your password?&rdquo; in the app. We&rsquo;ll email
            you a link to set a new one.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-heading text-xl">
            How do I report a painting or comment?
          </h2>
          <p>
            On the website, use Report this post on the painting, or the{" "}
            <Link href="/report" prefetch={false} className={link}>
              report form
            </Link>
            . In the app, tap &#8943; on the painting or comment and choose
            report. You don&rsquo;t need an account. Every report gets a
            reference number, and we review it and remove anything that breaks
            our{" "}
            <Link href="/terms" prefetch={false} className={link}>
              terms
            </Link>
            .
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-heading text-xl">How do I block someone?</h2>
          <p>
            In the app, tap &#8943; on one of their paintings, a comment of
            theirs, or their profile, and choose block. You won&rsquo;t see their
            paintings or comments anymore, and they aren&rsquo;t told. To undo
            it, go to Profile, settings, blocked artists.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-heading text-xl">How do I delete my account?</h2>
          <p>
            See{" "}
            <Link href="/delete-account" prefetch={false} className={link}>
              Delete your account
            </Link>{" "}
            for the steps and what gets deleted.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-heading text-xl">More</h2>
          <p>
            <Link href="/privacy" prefetch={false} className={link}>
              Privacy policy
            </Link>
            ,{" "}
            <Link href="/terms" prefetch={false} className={link}>
              terms of use
            </Link>{" "}
            and{" "}
            <Link href="/accessibility" prefetch={false} className={link}>
              accessibility
            </Link>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
