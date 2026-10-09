import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BUSINESS_POINTS,
  CALL_FAQ,
  CALL_JSON_LD,
  CALLER_STEPS,
  NEVER_DOES,
  SHOP_TYPES,
} from "@/lib/call-content";
import {
  CALL_LINE,
  CALL_LINE_LIVE,
  CALL_LINE_TEL,
  mailto,
} from "@/lib/call-line";

const TITLE = CALL_LINE_LIVE
  ? `Easy is cool. Call ${CALL_LINE.vanity}`
  : `Easy is cool. ${CALL_LINE.vanity} is coming soon`;
const DESCRIPTION = CALL_LINE_LIVE
  ? `One local number for Albany, NY. Call ${CALL_LINE.vanity}, say what you need, and an AI assistant sends your request to a 4-star-or-better local shop.`
  : `Coming soon: one local number for Albany, NY. Say what you need and an AI assistant sends your request to a 4-star-or-better local shop. Not live yet.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: CALL_LINE.path },
  openGraph: {
    type: "website",
    siteName: "Albany AI Guy",
    url: `https://albanyaiguy.com${CALL_LINE.path}`,
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "Albany AI Guy",
      },
    ],
  },
};

const NOTIFY_MAILTO = mailto("Tell me when 518-726-COOL is live");
const JOIN_MAILTO = mailto("Join the Albany AI Guy Line directory");

function Section({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="scroll-mt-20 border-t border-border py-14 sm:py-20"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="font-mono text-micro uppercase text-primary">{eyebrow}</p>
        <h2 id={`${id}-title`} className="mt-2 font-display text-headline">
          {title}
        </h2>
        <div className="mt-8">{children}</div>
      </div>
    </section>
  );
}

/** The number, shown honestly: dialable only when live. */
function NumberCard() {
  return (
    <div className="call-card rounded-2xl border border-border p-5 sm:p-7">
      <p className="font-mono text-micro uppercase text-muted-foreground">
        {CALL_LINE_LIVE ? "The line" : "Planned number"}
      </p>
      {CALL_LINE_TEL ? (
        <a
          href={CALL_LINE_TEL}
          className="mt-2 block font-mono text-[clamp(1.9rem,1.2rem+3.4vw,3rem)] font-medium leading-none tracking-tight text-foreground"
        >
          {CALL_LINE.vanity}
        </a>
      ) : (
        <p className="mt-2 font-mono text-[clamp(1.9rem,1.2rem+3.4vw,3rem)] font-medium leading-none tracking-tight text-foreground">
          {CALL_LINE.vanity}
        </p>
      )}
      <p className="mt-2 font-mono text-sm tabular-nums text-muted-foreground">
        {CALL_LINE.digits}
      </p>
      {CALL_LINE_LIVE ? (
        <p className="mt-4 flex items-center gap-2 text-sm text-ok">
          <span aria-hidden className="pulse-dot size-2 rounded-full bg-ok" />
          Answering now, day or night
        </p>
      ) : (
        <p className="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
          <span
            aria-hidden
            className="mt-1.5 size-2 shrink-0 rounded-full bg-faint"
          />
          Not live yet. This number isn&apos;t connected, so please don&apos;t
          dial it yet.
        </p>
      )}
    </div>
  );
}

function PrimaryCta({ className }: { className?: string }) {
  return CALL_LINE_TEL ? (
    <Button asChild size="lg" className={className}>
      <a href={CALL_LINE_TEL}>Call {CALL_LINE.vanity}</a>
    </Button>
  ) : (
    <Button asChild size="lg" className={className}>
      <a href={NOTIFY_MAILTO}>Email me when it&apos;s live</a>
    </Button>
  );
}

export default function CallPage() {
  return (
    <main>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: static JSON-LD, "<" escaped
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(CALL_JSON_LD).replace(/</g, "\\u003c"),
        }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden pt-10 pb-14 sm:pt-20 sm:pb-20">
        <div className="pointer-events-none absolute inset-0 grid-bg" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <div>
            <Badge className="enter-1">
              Albany, NY ·{" "}
              {CALL_LINE_LIVE ? "Live now" : "Coming soon · Not live yet"}
            </Badge>
            <h1 className="enter-2 mt-5 font-display text-display">
              {CALL_LINE.tagline}
              <span className="block text-primary">
                {CALL_LINE_LIVE
                  ? `Call ${CALL_LINE.vanity}.`
                  : `${CALL_LINE.vanity} is coming soon.`}
              </span>
            </h1>
            <p className="enter-3 mt-5 max-w-xl text-lg text-muted-foreground">
              One local number for when you need a barber, a salon, a plumber,
              heat that works, an electrician, a mechanic, a cleaner, or a
              locksmith. Say what you need, and the line sends the job to a
              well-rated Albany shop.
            </p>
            <div className="enter-4 mt-7 hidden flex-wrap gap-3 md:flex">
              <PrimaryCta />
              <Button asChild size="lg" variant="outline">
                <a href="#businesses">Own an Albany shop?</a>
              </Button>
            </div>
          </div>
          <div className="enter-3">
            <NumberCard />
          </div>
        </div>
      </section>

      {/* Callers */}
      <Section
        id="how-it-works"
        eyebrow="For callers"
        title={CALL_LINE_LIVE ? "How a call works" : "How a call will work"}
      >
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {CALLER_STEPS.map((s, i) => (
            <li
              key={s.t}
              className="rounded-xl border border-border bg-card p-5"
            >
              <p className="font-mono text-micro uppercase text-primary">
                Step {i + 1}
              </p>
              <h3 className="mt-2 font-medium">{s.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
            </li>
          ))}
        </ol>
        <div className="mt-8">
          <h3 className="text-sm font-medium">Shops the line knows</h3>
          <ul className="mt-3 flex flex-wrap gap-2">
            {SHOP_TYPES.map((t) => (
              <li
                key={t}
                className="rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground"
              >
                {t}
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* Emergencies */}
      <section
        id="emergencies"
        aria-labelledby="emergencies-title"
        className="scroll-mt-20 border-t border-border py-10"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div
            role="note"
            className="rounded-2xl border border-destructive/50 bg-destructive/10 p-5 sm:p-7"
          >
            <h2
              id="emergencies-title"
              className="font-display text-headline text-foreground"
            >
              Emergency? Call 911.
            </h2>
            <p className="mt-3 max-w-2xl text-foreground/90">
              This line is not for emergencies. For a fire, a medical emergency,
              or someone in danger, call 911. If you smell gas, leave the
              building first, then call 911 or your gas utility&apos;s emergency
              line. If you describe an emergency on the line, it will tell you
              to call 911.
            </p>
          </div>
        </div>
      </section>

      {/* Businesses */}
      <Section
        id="businesses"
        eyebrow="For Albany businesses"
        title="Get your shop on the line"
      >
        <ul className="grid gap-3 sm:grid-cols-2">
          {BUSINESS_POINTS.map((p) => (
            <li
              key={p.t}
              className="rounded-xl border border-border bg-card p-5"
            >
              <h3 className="font-medium">{p.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{p.d}</p>
            </li>
          ))}
        </ul>
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <div>
            <h3 className="font-medium">What the line never does</h3>
            <ul className="mt-3 space-y-2 text-muted-foreground">
              {NEVER_DOES.map((n) => (
                <li key={n} className="flex gap-2">
                  <span aria-hidden className="text-faint">
                    —
                  </span>
                  {n}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-medium">Not signed up?</h3>
            <p className="mt-3 text-muted-foreground">
              The line can still mention your shop with its Google rating and
              read out your public phone number, so the caller calls you
              directly. Signing up lets the line send you the job.
            </p>
            <p className="mt-3 text-muted-foreground">
              Want to hear how it sounds? Try the{" "}
              <Link
                href="/shop-line"
                className="text-primary underline underline-offset-4"
              >
                518 Shop Line demo
              </Link>{" "}
              with a fictional barbershop.
            </p>
          </div>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <a href={JOIN_MAILTO}>Join the directory</a>
          </Button>
        </div>
      </Section>

      {/* Privacy */}
      <Section
        id="privacy"
        eyebrow="Privacy"
        title="No recordings. Just the request."
      >
        <ul className="grid gap-3 sm:grid-cols-3">
          <li className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-medium">Calls aren&apos;t recorded</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Call audio isn&apos;t saved. Speech is turned into text in the
              moment so the line can understand you.
            </p>
          </li>
          <li className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-medium">Only what the shop needs</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              If you make a request, your first name, number, the time you want,
              and an optional email go to the shop you chose. Nothing goes to
              shops that haven&apos;t signed up.
            </p>
          </li>
          <li className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-medium">It says it&apos;s an AI</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Every call starts by saying you&apos;re talking to an AI
              assistant. It never pretends to be a person.
            </p>
          </li>
        </ul>
        <p className="mt-6 max-w-2xl text-sm text-muted-foreground">
          Before launch, this page will say exactly how long request details are
          kept. Questions:{" "}
          <a
            href={`mailto:${CALL_LINE.email}`}
            className="font-mono text-primary underline underline-offset-4"
          >
            {CALL_LINE.email}
          </a>
        </p>
      </Section>

      {/* FAQ */}
      <Section id="faq" eyebrow="FAQ" title="Questions people ask">
        <div className="max-w-3xl divide-y divide-border border-y border-border">
          {CALL_FAQ.map((f) => (
            <details key={f.q} className="call-faq group">
              <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 py-4 font-medium">
                {f.q}
                <span
                  aria-hidden
                  className="text-faint transition-transform duration-300 group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="pb-5 text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
        <p className="mt-8 text-sm text-muted-foreground">
          More about the plan on the{" "}
          <Link
            href="/trunk-line"
            className="text-primary underline underline-offset-4"
          >
            trunk line overview
          </Link>
          .
        </p>
      </Section>

      {/* Phone-first sticky action bar */}
      <div className="call-bar sticky bottom-0 z-30 border-t border-border px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden">
        <PrimaryCta className="w-full" />
      </div>
    </main>
  );
}
