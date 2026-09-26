import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy | justpaint",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="font-heading text-4xl italic leading-tight sm:text-5xl">
        Privacy policy
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Last updated September 26, 2026
      </p>

      <div className="prose-content mt-10 flex flex-col gap-8 text-sm leading-relaxed text-foreground/90">
        <p>
          justpaint is a small, independently run project. This page explains
          what data we collect and how we use it.
        </p>

        <section>
          <h2 className="mb-2 font-heading text-xl">What we collect</h2>
          <p className="mb-2 font-medium text-foreground">
            If you create an account:
          </p>
          <ul className="mb-4 list-disc space-y-1 pl-5">
            <li>
              Your email address and password. Passwords are handled
              entirely by our authentication provider (Supabase), so we
              never see or store them in plain text.
            </li>
            <li>The display name and bio you choose to add to your profile.</li>
            <li>Paintings you upload: the image, title, description, and tags.</li>
            <li>Likes and comments you make.</li>
          </ul>
          <p className="mb-2 font-medium text-foreground">
            If you post as a guest (no account):
          </p>
          <ul className="mb-4 list-disc space-y-1 pl-5">
            <li>
              The name you type in when uploading, plus the painting itself.
              We don&rsquo;t collect an email address or anything else
              identifying for guest posts.
            </li>
            <li>
              Photos often carry hidden details like the location they were
              taken and the phone that took them. We strip all of that from
              every image before it&rsquo;s stored or shown.
            </li>
          </ul>
          <p className="mb-2 font-medium text-foreground">
            If you report a post:
          </p>
          <ul className="mb-4 list-disc space-y-1 pl-5">
            <li>
              The link to the post, what you told us about it, your email
              address, and the name you signed with. We use these only to
              review the report and follow up with you, and keep them for two
              years as a record of the request and what we did about it. They
              aren&rsquo;t shown publicly or to the person who posted.
            </li>
          </ul>
          <p className="mb-2 font-medium text-foreground">
            Automatically, for anyone using the site:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Standard server request logs collected by our hosting
              provider (Vercel), like IP address, browser type, and
              timestamps. These are used only to operate and secure the
              site.
            </li>
            <li>
              A scrambled (one-way hashed) version of your IP address. When
              you upload, it&rsquo;s kept for two days to limit how many
              uploads can come from one place. When you heart a painting,
              it&rsquo;s kept for as long as the heart is, so each painting
              gets one heart per visitor. We never store your actual IP, and
              it&rsquo;s never shown publicly. If you&rsquo;re logged in, we
              use a scrambled version of your account ID for this instead of
              your IP.
            </li>
            <li>
              Visit statistics collected by Google Analytics: which pages
              you view, roughly where you are (city or country level), your
              device and browser type, and how you found the site. We use
              this only to understand how many people visit and what they
              look at.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 font-heading text-xl">What we don&rsquo;t do</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>We don&rsquo;t run ads or use advertising trackers.</li>
            <li>
              We don&rsquo;t use Google Analytics data for advertising or
              ad personalization.
            </li>
            <li>We don&rsquo;t sell your data to anyone.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 font-heading text-xl">
            Cookies and browser storage
          </h2>
          <p className="mb-2">
            Here&rsquo;s what justpaint stores in your browser. None of it is
            used for advertising.
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <span className="font-medium text-foreground">Hearts:</span> your
              browser remembers which paintings you&rsquo;ve hearted (a list of
              painting IDs in local storage). It stays on your device and
              isn&rsquo;t sent to us.
            </li>
            <li>
              <span className="font-medium text-foreground">Sign-in:</span>{" "}
              small cookies that keep you signed in, if you have an account
              (and for site admins).
            </li>
            <li>
              <span className="font-medium text-foreground">
                Google Analytics:
              </span>{" "}
              cookies (named <code>_ga</code>) that let Google Analytics
              recognize return visits so we can count visitors. You can
              block them in your browser&rsquo;s cookie settings or with{" "}
              <a
                href="https://tools.google.com/dlpage/gaoptout"
                className="text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google&rsquo;s opt-out add-on
              </a>
              .
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 font-heading text-xl">Do Not Track</h2>
          <p>
            Some browsers can send a &ldquo;Do Not Track&rdquo; signal.
            justpaint doesn&rsquo;t respond to it: Google Analytics runs the
            same way whether or not the signal is on. To keep Google
            Analytics from counting your visits, use the opt-out add-on or
            block cookies as described above.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-heading text-xl">Who we share data with</h2>
          <p className="mb-2">
            We use four service providers to run justpaint, and your data
            passes through them as part of normal operation:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <span className="font-medium text-foreground">Supabase</span>{" "}
              hosts our database, handles authentication, and stores
              uploaded images.
            </li>
            <li>
              <span className="font-medium text-foreground">Vercel</span>{" "}
              hosts the website itself.
            </li>
            <li>
              <span className="font-medium text-foreground">Resend</span>{" "}
              sends account emails, like the link to confirm your email
              address. It receives your email address to do that.
            </li>
            <li>
              <span className="font-medium text-foreground">Google</span>{" "}
              provides Google Analytics. Google handles that data under{" "}
              <a
                href="https://policies.google.com/privacy"
                className="text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                its own privacy policy
              </a>
              .
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 font-heading text-xl">Public content</h2>
          <p>
            Paintings, titles, descriptions, tags, comments, and profile
            display names and bios are public by design. That&rsquo;s the
            point of the site. Please don&rsquo;t upload or post
            anything you don&rsquo;t want visible to anyone who visits
            justpaint.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-heading text-xl">Your choices</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              To have a painting you posted taken down, or your account and
              everything in it deleted, email{" "}
              <a
                href="mailto:thewcookie@gmail.com"
                className="text-primary hover:underline"
              >
                thewcookie@gmail.com
              </a>
              .
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 font-heading text-xl">Children&rsquo;s privacy</h2>
          <p>
            justpaint isn&rsquo;t directed at children under 13, and we
            don&rsquo;t knowingly collect data from children under 13.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-heading text-xl">Changes to this policy</h2>
          <p>
            If this policy changes in a meaningful way, we&rsquo;ll update
            the date at the top of this page.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-heading text-xl">Contact</h2>
          <p>
            Questions about this policy? Email{" "}
            <a
              href="mailto:thewcookie@gmail.com"
              className="text-primary hover:underline"
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
