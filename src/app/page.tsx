import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HOME_FAQ, HOME_FAQ_JSON_LD } from "@/lib/home-content";

export const metadata: Metadata = {
  title: {
    absolute:
      "Albany AI Guy | Albany trunk line & AI voice receptionist for local businesses",
  },
  description:
    "One local number for Albany, NY, and an AI phone receptionist that answers and books for Capital Region shops — barbers, salons, HVAC, plumbers. Coming soon — join the pilot.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Albany AI Guy",
    url: "https://albanyaiguy.com/",
    title: "Albany AI Guy",
    description:
      "Albany trunk-line concierge and AI voice receptionist for local businesses. Coming soon — join the pilot.",
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "Albany AI Guy — coming soon, join the pilot",
      },
    ],
  },
};

const PILOT_MAILTO = `mailto:hello@albanyaiguy.com?subject=${encodeURIComponent("Albany AI Guy pilot")}`;

const SHOP_TYPES = [
  "Barbershops",
  "Hair & nail salons",
  "HVAC & heating",
  "Plumbers",
  "Electricians",
  "Auto repair",
];

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
      className="scroll-mt-20 border-t border-border py-16 sm:py-20"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="font-mono text-micro uppercase text-primary">{eyebrow}</p>
        <h2 className="mt-2 font-display text-headline">{title}</h2>
        <div className="mt-6">{children}</div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <main>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: static JSON-LD, "<" escaped
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(HOME_FAQ_JSON_LD).replace(/</g, "\\u003c"),
        }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24">
        <div className="pointer-events-none absolute inset-0 grid-bg" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <Badge>Albany, NY · 518 · Coming soon</Badge>
          <h1 className="mt-5 max-w-4xl font-display text-display">
            Albany&apos;s trunk-line concierge and AI voice receptionist for
            local businesses
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
            I&apos;m Chad Lenseth, the Albany AI Guy. I&apos;m building two
            things for the Capital Region: one local number you can call to find
            and book a trusted shop, and an AI receptionist that answers a
            shop&apos;s phone when the owner can&apos;t. Neither is live yet —
            I&apos;m looking for a small group of Albany-area shops to pilot it
            with me.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <a href={PILOT_MAILTO}>Join the pilot</a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/shop-line">Try the barbershop demo</Link>
            </Button>
          </div>
        </div>
      </section>

      <Section
        id="trunk-line"
        eyebrow="For callers"
        title="The Albany trunk line"
      >
        <div className="grid gap-8 lg:grid-cols-2">
          <p className="max-w-xl text-muted-foreground">
            One number for the 518. Call it, say what you need — a haircut
            today, no heat, a leaking pipe — and the line finds a qualifying
            local shop, then books it or asks the shop to call you back.
            Bookings only go to shops that have opted in as partners.
          </p>
          <ul className="space-y-3 text-sm">
            <li className="rounded-lg border border-border bg-card p-4">
              <strong className="text-foreground">Say it once.</strong>{" "}
              <span className="text-muted-foreground">
                No apps, no forms — just a phone call.
              </span>
            </li>
            <li className="rounded-lg border border-border bg-card p-4">
              <strong className="text-foreground">Local shops first.</strong>{" "}
              <span className="text-muted-foreground">
                Albany, Schenectady, Rensselaer, and Saratoga counties.
              </span>
            </li>
            <li className="rounded-lg border border-border bg-card p-4">
              <strong className="text-foreground">Status: coming soon.</strong>{" "}
              <span className="text-muted-foreground">
                The public number isn&apos;t live yet.
              </span>
            </li>
          </ul>
        </div>
        <p className="mt-6">
          <Link
            href="/trunk-line"
            className="text-primary underline-offset-4 hover:underline"
          >
            How the trunk line will work →
          </Link>
        </p>
      </Section>

      <Section
        id="receptionist"
        eyebrow="For local businesses"
        title="An AI voice receptionist for your shop phone"
      >
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="max-w-xl space-y-4 text-muted-foreground">
            <p>
              Your phone rings while you&apos;re mid-cut, under a sink, or
              closed for the night. The AI receptionist picks up, talks to the
              caller like a front desk would, books the appointment or takes a
              callback request, and sends you a short summary.
            </p>
            <p>
              It&apos;s built for small Capital Region shops that miss calls
              because they&apos;re busy doing the work. It can always hand off
              to a real person.
            </p>
          </div>
          <div>
            <p className="font-mono text-micro uppercase text-faint">
              Built for shops like
            </p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {SHOP_TYPES.map((t) => (
                <li
                  key={t}
                  className="rounded-full border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground"
                >
                  {t}
                </li>
              ))}
            </ul>
            <div className="mt-6 rounded-xl border border-primary/30 bg-card p-5">
              <p className="font-medium">Try it now in your browser</p>
              <p className="mt-1 text-sm text-muted-foreground">
                The 518 Shop Line demo is a fictional barbershop. Talk or type
                like a customer and watch it book you.
              </p>
              <Button asChild className="mt-4" variant="outline">
                <Link href="/shop-line">Open the demo</Link>
              </Button>
            </div>
          </div>
        </div>
      </Section>

      <Section id="status" eyebrow="Straight answer" title="Where things stand">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="font-mono text-micro uppercase text-ok">Live now</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                The 518 Shop Line web demo (a fictional barbershop) at
                /shop-line
              </li>
              <li>This site, and email at hello@albanyaiguy.com</li>
            </ul>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="font-mono text-micro uppercase text-primary">
              Coming soon
            </p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>The public trunk-line phone number</li>
              <li>The AI receptionist on real shop phones</li>
              <li>A directory of opted-in partner shops</li>
            </ul>
          </div>
        </div>
        <p className="mt-6 max-w-2xl text-sm text-muted-foreground">
          You won&apos;t see customer counts or testimonials here yet, because
          there aren&apos;t any. When pilot shops are live, they&apos;ll be
          listed with their permission.
        </p>
      </Section>

      <Section
        id="about"
        eyebrow="Who's behind it"
        title="Chad Lenseth, Albany AI Guy"
      >
        <p className="max-w-2xl text-muted-foreground">
          I live and work in Albany, NY. I build practical AI tools for local
          businesses — one job per tool, set up properly, with a real person
          (me) behind it when something needs fixing.{" "}
          <a
            href="https://www.linkedin.com/in/chad-lenseth-26b55938"
            className="text-primary underline-offset-4 hover:underline"
            rel="me noopener"
          >
            Find me on LinkedIn
          </a>
          .
        </p>
      </Section>

      <Section id="faq" eyebrow="Questions" title="FAQ">
        <dl className="grid gap-4 lg:grid-cols-2">
          {HOME_FAQ.map((f) => (
            <div
              key={f.q}
              className="rounded-xl border border-border bg-card p-5"
            >
              <dt className="font-medium">{f.q}</dt>
              <dd className="mt-2 text-sm text-muted-foreground">{f.a}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section
        id="pilot"
        eyebrow="Join the pilot"
        title="Run a 518 shop? Pilot it with me."
      >
        <p className="max-w-2xl text-muted-foreground">
          I&apos;m starting with a small group of Albany-area shops. We&apos;ll
          keep the pilot simple and shape it around how your shop actually runs.
          Email your shop&apos;s name, type of business, and town to{" "}
          <a
            href={PILOT_MAILTO}
            className="font-mono text-primary underline-offset-4 hover:underline"
          >
            hello@albanyaiguy.com
          </a>
          .
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <a href={PILOT_MAILTO}>Join the pilot</a>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/contact">Contact form</Link>
          </Button>
        </div>
      </Section>
    </main>
  );
}
