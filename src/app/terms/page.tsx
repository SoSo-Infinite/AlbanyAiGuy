import type { Metadata } from "next";
import Link from "next/link";
import { PageBand } from "@/components/motion/page-band";
import { PageTransition } from "@/components/motion/page-transition";
import { Badge } from "@/components/ui/badge";
import { socialMeta } from "@/lib/social";

const TITLE = "Terms of use";
const DESCRIPTION =
  "Plain-language terms for using albanyaiguy.com and its demos.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/terms" },
  ...socialMeta({
    type: "website",
    siteName: "Albany AI Guy",
    url: "https://albanyaiguy.com/terms",
    title: `${TITLE} | Albany AI Guy`,
    description: DESCRIPTION,
    image: { url: "/og.jpg", width: 1200, height: 630, alt: "Albany AI Guy" },
  }),
};

const ITEMS: { h: string; p: string }[] = [
  {
    h: "Who runs this site",
    p: "albanyaiguy.com is run by Chad Lenseth in Albany, NY. Questions go to hello@albanyaiguy.com.",
  },
  {
    h: "The demos are demos",
    p: "The shop line and missed-calls demos use a fictional shop and sample numbers. They show how things could work. They are not a quote, a booking, or a promise of results for your business.",
  },
  {
    h: "No emergencies",
    p: "Nothing on this site is an emergency service. If someone is in danger, call 911. For a mental health crisis, call or text 988.",
  },
  {
    h: "Using the site",
    p: "Please don't try to break the site, overload it, or use the demos to send anything harmful. Access can be limited for anyone who does.",
  },
  {
    h: "Content",
    p: "The words, images and the Albany AI Guy character on this site belong to Albany AI Guy. Links to other sites are there to help; those sites have their own terms.",
  },
  {
    h: "No warranty",
    p: "The site and demos are provided as they are, without guarantees, to the extent the law allows.",
  },
  {
    h: "Changes",
    p: "These terms may be updated. The date below shows the latest version. They are governed by New York law.",
  },
];

export default function TermsPage() {
  return (
    <PageTransition>
      <main className="site-main">
        <PageBand />
        <section className="relative overflow-hidden pt-12 pb-10 sm:pt-20 sm:pb-14">
          <div className="pointer-events-none absolute inset-0 grid-bg" />
          <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
            <Badge>Albany, NY · 518 · Terms</Badge>
            <h1 className="mt-5 max-w-3xl font-display text-display">
              Terms of use
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
              The short version of the rules for this site. For how your
              information is handled, see{" "}
              <Link href="/privacy" className="underline underline-offset-4">
                Privacy
              </Link>
              .
            </p>
          </div>
        </section>
        <section
          aria-label="Terms"
          className="border-t border-border py-12 sm:py-16"
        >
          <div className="mx-auto grid max-w-3xl gap-8 px-4 sm:px-6">
            {ITEMS.map((item) => (
              <div key={item.h}>
                <h2 className="font-display text-xl">{item.h}</h2>
                <p className="mt-2 text-muted-foreground">{item.p}</p>
              </div>
            ))}
            <p className="font-mono text-xs text-muted-foreground">
              Last updated October 12, 2026
            </p>
          </div>
        </section>
      </main>
    </PageTransition>
  );
}
