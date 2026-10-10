import type { Metadata } from "next";
import Link from "next/link";
import { CopyPrompt } from "@/components/copy-prompt";
import { Badge } from "@/components/ui/badge";
import { socialMeta } from "@/lib/social";
import { TIPS, TIPS_JSON_LD } from "@/lib/tips-content";

const TITLE = "Free AI tips";
const DESCRIPTION =
  "Copy-and-paste AI prompts that save real time: prep any phone call in 30 seconds, write your missed-call text, fix your voicemail, read fine print in plain English. Free, no sign-up.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/tips" },
  ...socialMeta({
    type: "website",
    siteName: "Albany AI Guy",
    url: "https://albanyaiguy.com/tips",
    title: `${TITLE} | Albany AI Guy`,
    description: DESCRIPTION,
    image: { url: "/og.jpg", width: 1200, height: 630, alt: "Albany AI Guy" },
  }),
};

export default function TipsPage() {
  return (
    <main>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: static JSON-LD, "<" escaped
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(TIPS_JSON_LD).replace(/</g, "\\u003c"),
        }}
      />
      <section className="relative overflow-hidden pt-12 pb-10 sm:pt-20 sm:pb-14">
        <div className="pointer-events-none absolute inset-0 grid-bg" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <Badge>Albany, NY · 518 · Free tips</Badge>
          <h1 className="mt-5 max-w-3xl font-display text-display">
            AI tips you can use today
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
            Simple rule I build by: easier is cool. These are the prompts I tell
            people about first. Copy one into any free AI assistant (ChatGPT,
            Grok, Gemini, Claude), fill in the brackets, and go. No sign-up
            here, and this page doesn&apos;t save anything you do.
          </p>
        </div>
      </section>

      <section
        aria-label="Tips"
        className="border-t border-border py-12 sm:py-16"
      >
        <ol className="mx-auto grid max-w-6xl gap-4 px-4 sm:px-6 lg:grid-cols-2">
          {TIPS.map((t) => (
            <li
              key={t.id}
              id={t.id}
              className="flex scroll-mt-20 flex-col rounded-xl border border-border bg-card p-5 sm:p-6"
            >
              <p className="font-mono text-micro uppercase text-primary">
                {t.forWho}
              </p>
              <h2 className="mt-2 font-display text-title">{t.title}</h2>
              <p className="mt-3 text-muted-foreground">{t.why}</p>
              <p className="mt-4 text-sm font-semibold">The prompt</p>
              <blockquote className="mt-2 whitespace-pre-line rounded-lg border border-border bg-background p-3 font-mono text-sm leading-relaxed">
                {t.prompt}
              </blockquote>
              {t.note ? (
                <p className="mt-3 text-sm text-muted-foreground">{t.note}</p>
              ) : null}
              <div className="sm:mt-auto">
                <CopyPrompt prompt={t.prompt} title={t.title} />
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section
        aria-labelledby="more-h"
        className="border-t border-border py-12 sm:py-16"
      >
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 id="more-h" className="font-display text-headline">
            Want it to just happen?
          </h2>
          <p className="mt-4 text-muted-foreground">
            The shop-owner tips are the manual version of what I build: the
            phone answered, the question handled, the request written down
            before it goes cold. See the{" "}
            <Link className="underline underline-offset-4" href="/shop-line">
              barbershop demo
            </Link>{" "}
            or{" "}
            <Link className="underline underline-offset-4" href="/work">
              what I&apos;ve built
            </Link>
            .
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            “Open in ChatGPT” opens chatgpt.com with the prompt typed in; you
            still tap send, and their privacy terms apply there. These tips are
            general information, not legal, medical or financial advice.
          </p>
          <p className="mt-6 text-muted-foreground">
            Estimate missed-call revenue from your own numbers.
          </p>
          <p>
            <Link
              href="/tools/missed-calls"
              className="inline-flex min-h-11 items-center rounded-sm underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
            >
              Missed-call cost calculator
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
