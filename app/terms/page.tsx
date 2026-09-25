import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms — justpaint",
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="font-heading text-4xl italic leading-tight sm:text-5xl">
        Terms of use
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Last updated September 25, 2026
      </p>

      <div className="prose-content mt-10 flex flex-col gap-8 text-sm leading-relaxed text-foreground/90">
        <p>
          justpaint is a small, independently run place to share paintings.
          By using the site or posting to it, you agree to these terms. If you
          don&rsquo;t agree, please don&rsquo;t use justpaint.
        </p>

        <section>
          <h2 className="mb-2 font-heading text-xl">Who can post</h2>
          <p>
            You must be 13 or older to upload a painting or otherwise post to
            justpaint. If we learn that something was posted by someone under
            13, we&rsquo;ll remove it.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-heading text-xl">What you can post</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Only paintings you made yourself. Don&rsquo;t post other
              people&rsquo;s work, even with credit.
            </li>
            <li>
              justpaint is for what you painted today &mdash; please
              don&rsquo;t upload older, previously finished paintings.
            </li>
            <li>
              Nothing hateful, harassing, sexually explicit, violent, or
              illegal, and nothing that shares someone else&rsquo;s private
              information.
            </li>
            <li>No spam, ads, or links meant to sell something.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 font-heading text-xl">Your paintings stay yours</h2>
          <p>
            You keep ownership of everything you post. By posting, you give
            justpaint permission to store, display, and resize your painting
            and its title, description, and tags on the site so other people
            can see it. That permission ends when your post is deleted, apart
            from copies that take a short while to clear from backups or
            caches.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-heading text-xl">Removing posts</h2>
          <p>
            We can remove any post, at any time, for any reason &mdash;
            including anything that breaks these terms. To have one of your
            own posts taken down, email{" "}
            <a
              href="mailto:matthewzhenghi@gmail.com"
              className="text-primary hover:underline"
            >
              matthewzhenghi@gmail.com
            </a>
            . If you believe something on justpaint uses your work without
            permission, email the same address with a link to the post and
            we&rsquo;ll look into it.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-heading text-xl">Privacy</h2>
          <p>
            How we handle your data is covered in our{" "}
            <Link href="/privacy" className="text-primary hover:underline">
              privacy policy
            </Link>
            .
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-heading text-xl">No guarantees</h2>
          <p>
            justpaint is provided as is. We try to keep it running and your
            posts safe, but we can&rsquo;t promise the site will always be
            available or that nothing will ever be lost &mdash; keep your own
            copies of anything you care about. To the extent the law allows,
            justpaint isn&rsquo;t liable for losses that come from using the
            site or from content other people post.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-heading text-xl">Changes to these terms</h2>
          <p>
            If these terms change in a meaningful way, we&rsquo;ll update the
            date at the top of this page. Continuing to use justpaint after
            that means you accept the updated terms.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-heading text-xl">Contact</h2>
          <p>
            Questions about these terms? Email{" "}
            <a
              href="mailto:matthewzhenghi@gmail.com"
              className="text-primary hover:underline"
            >
              matthewzhenghi@gmail.com
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
