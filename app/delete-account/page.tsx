import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Delete your account | justpaint",
  description: "How to delete your justpaint account from the justPaint Art app, the website, or by email, and what gets deleted.",
  alternates: { canonical: "/delete-account" },
};

const EMAIL = "thewcookie@gmail.com";
const link = "text-primary underline underline-offset-2";

export default function DeleteAccountPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="font-heading text-4xl italic leading-tight sm:text-5xl">
        Delete your account
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        For justpaint.art and the justPaint Art app
      </p>

      <div className="prose-content mt-10 flex flex-col gap-8 text-sm leading-relaxed text-foreground/90">
        <p>
          One account works on both the website and the app, so deleting it
          once deletes it everywhere. It can&rsquo;t be undone.
        </p>

        <section>
          <h2 className="mb-2 font-heading text-xl">In the app</h2>
          <ol className="list-decimal space-y-1 pl-5">
            <li>Open justPaint Art and sign in.</li>
            <li>Go to Profile, then settings.</li>
            <li>Tap delete account, then confirm.</li>
          </ol>
        </section>

        <section>
          <h2 className="mb-2 font-heading text-xl">On the website</h2>
          <ol className="list-decimal space-y-1 pl-5">
            <li>
              <Link href="/login" prefetch={false} className={link}>
                Log in
              </Link>{" "}
              to justpaint.art.
            </li>
            <li>Open your profile and choose Edit profile.</li>
            <li>Choose Delete account, then confirm.</li>
          </ol>
        </section>

        <section>
          <h2 className="mb-2 font-heading text-xl">By email</h2>
          <p>
            If you can&rsquo;t sign in, email{" "}
            <a href={`mailto:${EMAIL}?subject=Delete%20my%20account`} className={link}>
              {EMAIL}
            </a>{" "}
            from the address on your account, with &ldquo;Delete my
            account&rdquo; as the subject. We&rsquo;ll delete it within 30 days
            and reply when it&rsquo;s done.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-heading text-xl">What gets deleted</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>your sign-in: email address and password</li>
            <li>your profile: display name, bio and picture</li>
            <li>every painting you posted, with its pictures, hearts and comments</li>
            <li>the comments you wrote on other people&rsquo;s paintings</li>
            <li>your notifications and the people you blocked</li>
          </ul>
          <p className="mt-2">
            It happens right away. Copies of pictures can take up to an hour to
            clear from caches.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-heading text-xl">What we keep</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Hearts you gave stay in other people&rsquo;s heart counts. They
              were stored only as a scrambled code, not your name or email, and
              can&rsquo;t be traced back to you.
            </li>
            <li>
              Reports you sent are kept for two years as a record of the request
              and what we did about it, as our{" "}
              <Link href="/privacy" prefetch={false} className={link}>
                privacy policy
              </Link>{" "}
              says.
            </li>
            <li>
              Paintings posted as a guest aren&rsquo;t tied to an account. To
              have one removed, email us its link.
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}
