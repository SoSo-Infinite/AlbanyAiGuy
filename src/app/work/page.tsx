import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HOW_I_BUILD, WORK, WORK_JSON_LD } from "@/lib/work-content";

const TITLE = "Things I’ve built";
const DESCRIPTION =
  "Real tools Chad Lenseth, the Albany AI Guy, has built for the Capital Region: a barbershop AI front-desk demo, the 518 trunk line in testing, HelpGetUp, Live Well Go and the AeraSell store audit.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/work" },
  openGraph: {
    type: "website",
    siteName: "Albany AI Guy",
    url: "https://albanyaiguy.com/work",
    title: `${TITLE} | Albany AI Guy`,
    description: DESCRIPTION,
    images: [
      { url: "/og.jpg", width: 1200, height: 630, alt: "Albany AI Guy" },
    ],
  },
};

const PILOT_MAILTO = `mailto:hello@albanyaiguy.com?subject=${encodeURIComponent("Albany AI Guy pilot")}`;

export default function WorkPage() {
  return (
    <main>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: static JSON-LD, "<" escaped
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(WORK_JSON_LD).replace(/</g, "\\u003c"),
        }}
      />
      <section className="relative overflow-hidden pt-12 pb-10 sm:pt-20 sm:pb-14">
        <div className="pointer-events-none absolute inset-0 grid-bg" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <Badge>Albany, NY · 518 · Work</Badge>
          <h1 className="mt-5 max-w-3xl font-display text-display">
            Things I&apos;ve built
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
            Before I ask a shop to trust me with its phone, here&apos;s what
            I&apos;ve already built. Every link below works today. If something
            isn&apos;t live yet, it says so.
          </p>
        </div>
      </section>

      <section
        aria-label="Projects"
        className="border-t border-border py-12 sm:py-16"
      >
        <ul className="mx-auto grid max-w-6xl gap-4 px-4 sm:px-6 lg:grid-cols-2">
          {WORK.map((w) => (
            <li
              key={w.id}
              id={w.id}
              className="flex scroll-mt-20 flex-col rounded-xl border border-border bg-card p-5 sm:p-6"
            >
              <p className="font-mono text-micro uppercase text-primary">
                {w.status}
              </p>
              <h2 className="mt-2 font-display text-title">{w.name}</h2>
              <p className="mt-3 text-foreground">{w.what}</p>
              <p className="mt-3 text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">
                  What it shows:{" "}
                </span>
                {w.shows}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">
                  Good to know:{" "}
                </span>
                {w.honest}
              </p>
              <div className="mt-5 pt-1 sm:mt-auto">
                <Button asChild variant="outline">
                  {w.external ? (
                    <a href={w.href} target="_blank" rel="noopener noreferrer">
                      {w.linkLabel}
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  ) : (
                    <Link href={w.href}>{w.linkLabel}</Link>
                  )}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section
        aria-labelledby="how-h"
        className="border-t border-border py-12 sm:py-16"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="font-mono text-micro uppercase text-primary">
            How I build
          </p>
          <h2 id="how-h" className="mt-2 font-display text-headline">
            The rules every project follows
          </h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {HOW_I_BUILD.map((h) => (
              <li
                key={h.title}
                className="rounded-xl border border-border p-4 sm:p-5"
              >
                <p className="font-semibold">{h.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{h.body}</p>
              </li>
            ))}
          </ul>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <a href={PILOT_MAILTO}>Join the pilot</a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/contact">Ask me a question</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
