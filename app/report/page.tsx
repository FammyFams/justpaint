import type { Metadata } from "next";
import Link from "next/link";
import { ReportForm } from "@/components/report-form";
import { paintingIdFrom } from "@/lib/validations/report";
import { getSiteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Report a post | justpaint",
  description: "Ask us to remove a post, including intimate images shared without consent.",
};

// The notice-and-removal process the TAKE IT DOWN Act requires: plain
// language, linked from every page (footer) and every post, no account needed.
export default async function ReportPage({
  searchParams,
}: {
  searchParams: Promise<{ painting?: string }>;
}) {
  const id = paintingIdFrom((await searchParams).painting ?? "");
  const paintingLink = id ? `${getSiteUrl()}/painting/${id}` : undefined;

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="font-heading text-4xl italic leading-tight sm:text-5xl">Report a post</h1>

      <div className="mt-6 flex flex-col gap-4 text-sm leading-relaxed text-foreground/90">
        <p>
          Use this form to ask us to take down a post. You don&rsquo;t need an account.
        </p>
        <p>
          <span className="font-medium text-foreground">
            Intimate images shared without consent.
          </span>{" "}
          If a post shows you (or someone you&rsquo;re authorized to act for) in an intimate or
          sexual way without consent, including an AI-generated or edited fake, report it here.
          When we get a valid request, we remove the post and any identical copies on justpaint{" "}
          <span className="font-medium text-foreground">within 48 hours</span>, and usually much
          sooner.
        </p>
        <p>
          You&rsquo;ll get a reference number when you send the form. Every report is reviewed by
          a person. We keep a record of each request and what we did about it.
        </p>
        <p>
          Prefer email? Send the same information (the post link, what&rsquo;s wrong, how to reach
          you, and your full name as a signature) to{" "}
          <a href="mailto:matthewzhenghi@gmail.com" className="text-primary hover:underline">
            matthewzhenghi@gmail.com
          </a>
          . For copyright problems, use the{" "}
          <Link href="/terms" className="text-primary hover:underline">
            copyright (DMCA) process in our Terms
          </Link>
          .
        </p>
        <p className="text-muted-foreground">
          If a child is being exploited, also report it to the National Center for Missing &amp;
          Exploited Children at{" "}
          <a
            href="https://report.cybertip.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            report.cybertip.org
          </a>
          . If someone is in immediate danger, call 911. For help with intimate images shared
          online, see{" "}
          <a
            href="https://takeitdown.ncmec.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Take It Down
          </a>{" "}
          (under 18) or{" "}
          <a
            href="https://stopncii.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            StopNCII
          </a>{" "}
          (18 and over).
        </p>
      </div>

      <div className="mt-8 rounded-sm border border-border/70 bg-card p-6 shadow-[0_1px_2px_rgba(0,0,34,0.06)]">
        <ReportForm paintingLink={paintingLink} />
      </div>
    </main>
  );
}
