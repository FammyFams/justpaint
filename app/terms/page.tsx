import type { Metadata } from "next";
import Link from "next/link";
import { TodayMark } from "@/components/today-mark";

export const metadata: Metadata = {
  title: "Terms | justpaint",
  description: "The rules for justpaint and the justPaint Art app: 13 and older, only your own new paintings, no tolerance for abuse, and how removals and copyright requests work.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="font-heading text-4xl italic leading-tight sm:text-5xl">
        Terms of use
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Last updated October 8, 2026
      </p>

      <div className="prose-content mt-10 flex flex-col gap-8 text-sm leading-relaxed text-foreground/90">
        <p>
          justpaint is a small, independently run place to share paintings,
          on justpaint.art and in the justPaint Art app for iPhone and Android.
          By using either one or posting to it, you agree to these terms. If
          you don&rsquo;t agree, please don&rsquo;t use justpaint.
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
              justpaint is for what you painted <TodayMark />. Please
              don&rsquo;t upload older, previously finished paintings.
            </li>
            <li>
              Nothing hateful, harassing, sexually explicit, violent, or
              illegal, and nothing that shares someone else&rsquo;s private
              information.
            </li>
            <li>
              Never an intimate or sexual image of a real person without
              their consent, including AI-generated or edited fakes. Never
              anything sexualizing a minor: we remove it, report it to the
              National Center for Missing &amp; Exploited Children, and delete
              the account behind it.
            </li>
            <li>No spam, ads, or links meant to sell something.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 font-heading text-xl">
            No tolerance for objectionable content or abuse
          </h2>
          <p>
            There is no tolerance for objectionable content or abusive users on
            justpaint. We remove posts and comments that break these terms, and
            we remove the accounts of people who post them or who harass
            others. Names, titles, descriptions and comments are checked for
            slurs and explicit words before they&rsquo;re posted.
          </p>
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
          <h2 className="mb-2 font-heading text-xl">Reporting, blocking and removing posts</h2>
          <p className="mb-2">
            Anyone can report a post, with or without an account, using the{" "}
            <Link href="/report" className="text-primary underline underline-offset-2">
              report form
            </Link>{" "}
            (also linked at the bottom of every page and on every post), the
            &#8943; menu in the app, or by email to{" "}
            <a
              href="mailto:thewcookie@gmail.com"
              className="text-primary underline underline-offset-2"
            >
              thewcookie@gmail.com
            </a>
            . Include the post&rsquo;s link, what&rsquo;s wrong with it, how
            to reach you, and your full name as a signature.
          </p>
          <p className="mb-2">
            If you report an intimate image of you (or someone you&rsquo;re
            authorized to act for) shared without consent, including an AI
            fake, we remove the post and any identical copies on justpaint
            within 48 hours of receiving a valid request. Every report gets a
            reference number, and we keep a record of each request and what we
            did about it.
          </p>
          <p className="mb-2">
            In the app, you can also block another member. You won&rsquo;t see
            their paintings or comments anymore, and they aren&rsquo;t told.
          </p>
          <p>
            We can also remove any post, at any time, for any reason,
            including anything that breaks these terms. If you have an
            account, you can delete your own posts yourself, and{" "}
            <Link href="/delete-account" className="text-primary underline underline-offset-2">
              your whole account
            </Link>{" "}
            at any time; guest posts can be taken down by emailing us. If
            something on justpaint uses your work without permission, see
            Copyright below.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-heading text-xl">Copyright (DMCA)</h2>
          <p className="mb-4">
            We respond to copyright infringement notices under the Digital
            Millennium Copyright Act. If a post on justpaint uses your work
            without permission, contact our designated agent.
          </p>

          <dl className="mb-6 grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 [&_dd]:[overflow-wrap:anywhere] gap-y-2 rounded-sm border border-border bg-card px-4 py-4 shadow-[0_1px_2px_rgba(0,0,34,0.06)]">
            <dt className="text-muted-foreground">Designated agent</dt>
            <dd className="font-medium text-foreground">Matthew Zheng</dd>
            <dt className="text-muted-foreground">Email</dt>
            <dd>
              <a
                href="mailto:thewcookie@gmail.com?subject=DMCA%20notice"
                className="text-primary underline underline-offset-2"
              >
                thewcookie@gmail.com
              </a>
            </dd>
            <dt className="text-muted-foreground">Registration</dt>
            <dd>
              <span className="text-foreground">DMCA-1081094</span>{" "}
              <span className="ml-1 inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                Active
              </span>
            </dd>
            <dt className="text-muted-foreground">Directory</dt>
            <dd>
              <a
                href="https://dmca.copyright.gov/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2"
              >
                U.S. Copyright Office DMCA Agent Directory
              </a>
            </dd>
          </dl>

          <h3 className="mb-2 font-medium text-foreground">
            What to include in a notice
          </h3>
          <ol className="mb-6 list-decimal space-y-1 pl-5">
            <li>The link to the post on justpaint.</li>
            <li>A description of your original work, or a link to it.</li>
            <li>Your name, mailing address, phone number, and email.</li>
            <li>
              A statement that you believe in good faith the use isn&rsquo;t
              authorized by you, your agent, or the law.
            </li>
            <li>
              A statement, under penalty of perjury, that your notice is
              accurate and that you own the work or are authorized to act for
              the owner.
            </li>
            <li>
              Your physical or electronic signature (typing your full
              name works).
            </li>
          </ol>

          <h3 className="mb-2 font-medium text-foreground">
            If your post was removed
          </h3>
          <p className="mb-6">
            When we get a complete notice, we remove the post. If you believe
            yours was removed by mistake, send a counter-notice to the same
            email with the removed post&rsquo;s link, a statement under penalty
            of perjury that it was removed by mistake or misidentification,
            your name and contact details, your consent to the jurisdiction of
            your local federal district court, and your signature.
          </p>

          <h3 className="mb-2 font-medium text-foreground">Repeat infringers</h3>
          <p>
            If we learn someone has repeatedly posted other people&rsquo;s
            work, we&rsquo;ll take down their posts and, where we can, stop
            them from posting again.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-heading text-xl">Privacy</h2>
          <p>
            How we handle your data is covered in our{" "}
            <Link href="/privacy" className="text-primary underline underline-offset-2">
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
            available or that nothing will ever be lost, so keep your own
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
            Questions about these terms? See{" "}
            <Link href="/support" className="text-primary underline underline-offset-2">
              support
            </Link>{" "}
            or email{" "}
            <a
              href="mailto:thewcookie@gmail.com"
              className="text-primary underline underline-offset-2"
            >
              thewcookie@gmail.com
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
