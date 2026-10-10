import type { Metadata } from "next";
import Link from "next/link";
import { CopyPrompt } from "@/components/copy-prompt";
import { MissedCallCalculator } from "@/components/missed-call-calculator";
import { Badge } from "@/components/ui/badge";
import { MISSED_CALL_DEFAULTS } from "@/lib/missed-calls";
import { CONTACT_NAV_LABEL } from "@/lib/nav";
import {
  CALL_PREP_OPEN_LABEL,
  CALL_PREP_PROMPT,
  CALL_PREP_URL,
  demoById,
  SHOP_LINE_POSTER_SRC,
  SHOP_LINE_TRANSCRIPT,
  SHOP_LINE_VIDEO_SRC,
  TRY_DEMOS,
} from "@/lib/try-demos";
import { HearYourShopForm } from "./hear-your-shop-form";

const TITLE = "Try it in 10 seconds";
const DESCRIPTION =
  "Watch a shop answer, estimate missed calls, prep a call, or hear a greeting. No sign-up, and nothing is stored.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/try" },
  openGraph: {
    type: "website",
    siteName: "Albany AI Guy",
    url: "https://albanyaiguy.com/try",
    title: `${TITLE} | Albany AI Guy`,
    description: DESCRIPTION,
    images: [
      { url: "/og.jpg", width: 1200, height: 630, alt: "Albany AI Guy" },
    ],
  },
};

const sectionClass = "scroll-mt-20 border-t border-border py-12 sm:py-16";
const wrapClass = "mx-auto max-w-3xl px-4 sm:px-6";
const linkClass =
  "inline-flex min-h-11 items-center rounded-sm underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60";

export default function TryPage() {
  const shopLine = demoById("shop-line");
  const missedCalls = demoById("missed-calls");
  const callPrep = demoById("call-prep");
  const hearYourShop = demoById("hear-your-shop");

  return (
    <main>
      <section className="relative overflow-hidden pt-12 pb-10 sm:pt-20 sm:pb-14">
        <div className="pointer-events-none absolute inset-0 grid-bg" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <Badge>Albany, NY · 518 · Demos</Badge>
          <h1 className="mt-5 max-w-3xl font-display text-display">{TITLE}</h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
            Four demos. No sign-up, and nothing is stored.
          </p>
          <nav aria-label="Demos" className="mt-6">
            <ul className="flex flex-wrap gap-2">
              {TRY_DEMOS.map((demo) => (
                <li key={demo.id}>
                  <a
                    href={`#${demo.id}`}
                    className="inline-flex min-h-11 items-center rounded-md border border-border px-3 text-sm text-foreground hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
                  >
                    {demo.jump}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>

      <section
        id="shop-line"
        aria-labelledby="shop-line-title"
        className={sectionClass}
      >
        <div className={wrapClass}>
          <h2 id="shop-line-title" className="font-display text-headline">
            {shopLine.title}
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            A 37-second clip of a fictional barbershop. The front desk answers,
            asks what you need, and books a time.
          </p>
          <figure className="mt-6">
            <video
              controls
              playsInline
              preload="none"
              poster={SHOP_LINE_POSTER_SRC}
              width={360}
              height={640}
              aria-label="37-second demo of a fictional barbershop front desk answering a call"
              className="aspect-[9/16] h-auto w-full max-w-[360px] rounded-xl border border-border bg-card"
            >
              <source src={SHOP_LINE_VIDEO_SRC} type="video/mp4" />
              <track
                kind="captions"
                src="/try/518-shop-line-demo.vtt"
                srcLang="en"
                label="English"
              />
              {"A 37-second demo clip. The transcript is below."}
            </video>
            <figcaption className="mt-3 max-w-xl text-sm text-muted-foreground">
              <p>This is a demo with a fictional barbershop.</p>
              <p>
                <Link href="/shop-line" className={linkClass}>
                  Try it yourself
                </Link>
              </p>
            </figcaption>
          </figure>
          <details className="mt-4 max-w-xl">
            <summary className="flex min-h-11 cursor-pointer items-center rounded-sm text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60">
              Transcript
            </summary>
            <div className="mt-3 grid gap-3 text-sm leading-relaxed text-muted-foreground">
              {SHOP_LINE_TRANSCRIPT.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </details>
        </div>
      </section>

      <section
        id="missed-calls"
        aria-labelledby="missed-calls-title"
        className={sectionClass}
      >
        <div className={wrapClass}>
          <h2 id="missed-calls-title" className="font-display text-headline">
            {missedCalls.title}
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Enter how many calls you miss in a week, what percent of them would
            have booked, and the average value of a job. The figure uses only
            those numbers.
          </p>
          <div className="mt-8">
            <MissedCallCalculator
              initial={{
                missedCallsPerWeek: MISSED_CALL_DEFAULTS.missedCallsPerWeek,
                bookingPercent: MISSED_CALL_DEFAULTS.bookingPercent,
                averageJobValue: MISSED_CALL_DEFAULTS.averageJobValue,
              }}
              idPrefix="try-"
              showContactLink={false}
            />
          </div>
        </div>
      </section>

      <section
        id="call-prep"
        aria-labelledby="call-prep-title"
        className={sectionClass}
      >
        <div className={wrapClass}>
          <h2 id="call-prep-title" className="font-display text-headline">
            {callPrep.title}
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Before you call, this prompt asks who you are calling and what the
            problem is. The prompt asks for a 30-second script and 3 questions.
            ChatGPT&apos;s own terms apply. This page sends nothing until you
            open the link.
          </p>
          <h3 className="mt-6 text-sm font-semibold">The prompt</h3>
          <blockquote className="mt-2 whitespace-pre-line rounded-lg border border-border bg-background p-3 font-mono text-sm leading-relaxed">
            {CALL_PREP_PROMPT}
          </blockquote>
          <CopyPrompt
            prompt={CALL_PREP_PROMPT}
            title={callPrep.title}
            href={CALL_PREP_URL}
            openLabel={CALL_PREP_OPEN_LABEL}
            openClassName="h-auto min-h-11 max-w-full whitespace-normal px-3 py-2 text-center"
          />
        </div>
      </section>

      <section
        id="hear-your-shop"
        aria-labelledby="hear-your-shop-title"
        className={sectionClass}
      >
        <div className={wrapClass}>
          <h2 id="hear-your-shop-title" className="font-display text-headline">
            {hearYourShop.title}
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Type a shop name. Add a service and your hours if you want. The
            greeting is built here and can be spoken by this browser. Nothing is
            sent, and nothing is recorded.
          </p>
          <div className="mt-8">
            <HearYourShopForm />
          </div>
        </div>
      </section>

      <section aria-label={CONTACT_NAV_LABEL} className={sectionClass}>
        <div className={wrapClass}>
          <Link href="/contact" className={linkClass}>
            {CONTACT_NAV_LABEL}
          </Link>
        </div>
      </section>
    </main>
  );
}
