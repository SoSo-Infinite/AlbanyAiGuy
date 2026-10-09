import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title:
    "The Albany trunk line: one number to find and book local shops (coming soon)",
  description:
    "One local number for Albany, Schenectady, Troy, and Saratoga. Say what you need and the line finds a vetted local shop and books it or requests a callback. Coming soon — join the pilot.",
  alternates: { canonical: "/trunk-line" },
  openGraph: {
    type: "website",
    siteName: "Albany AI Guy",
    url: "https://albanyaiguy.com/trunk-line",
    title: "The Albany trunk line (coming soon)",
    description:
      "One local number to find and book Capital Region shops. Coming soon — join the pilot.",
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

const PILOT_MAILTO = `mailto:hello@albanyaiguy.com?subject=${encodeURIComponent("Albany trunk line pilot")}`;

const STEPS = [
  {
    t: "You call one local number",
    d: "Say what you need in plain words: “a haircut this afternoon,” “my furnace stopped,” “a plumber for a leak.”",
  },
  {
    t: "The line figures out the job",
    d: "It works out what kind of shop you need, where you are, and how soon. Emergencies are sent to 911 right away.",
  },
  {
    t: "It finds a qualifying local shop",
    d: "It looks through Capital Region shops that have opted in as partners, starting with the best-rated one that has an opening.",
  },
  {
    t: "It books you or requests a callback",
    d: "If the shop takes bookings, you get a time. If not, the shop gets a callback request. Either way, it reads the details back to you.",
  },
];

export default function TrunkLinePage() {
  return (
    <main>
      <section className="relative overflow-hidden pt-12 pb-12 sm:pt-20">
        <div className="pointer-events-none absolute inset-0 grid-bg" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <Badge>Coming soon · Pilot forming now</Badge>
          <h1 className="mt-5 max-w-4xl font-display text-display">
            The Albany trunk line: one number to find and book a local shop
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
            A concierge phone line for the 518. Call, say what you need, and it
            connects you with a trusted Capital Region business. The number
            isn&apos;t live yet — this page explains how it will work.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            Planned number and caller guide:{" "}
            <Link
              href="/call"
              className="text-primary underline underline-offset-4"
            >
              Easy is cool. 518-726-COOL (coming soon)
            </Link>
          </p>
        </div>
      </section>

      <section className="border-t border-border py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="font-display text-headline">How it will work</h2>
          <ol className="mt-8 grid gap-4 sm:grid-cols-2">
            {STEPS.map((s, i) => (
              <li
                key={s.t}
                className="rounded-xl border border-border bg-card p-5"
              >
                <p className="font-mono text-micro uppercase text-primary">
                  Step {i + 1}
                </p>
                <p className="mt-2 font-medium">{s.t}</p>
                <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-t border-border py-14">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-headline">Ground rules</h2>
            <ul className="mt-5 space-y-3 text-muted-foreground">
              <li>Bookings only go to shops that have opted in as partners.</li>
              <li>
                Any shop listed without opting in will be clearly labeled “not a
                partner.”
              </li>
              <li>Not for emergencies — call 911.</li>
            </ul>
          </div>
          <div>
            <h2 className="font-display text-headline">Where it starts</h2>
            <p className="mt-5 text-muted-foreground">
              Albany, Schenectady, Rensselaer, and Saratoga counties — Albany,
              Troy, Schenectady, Saratoga Springs, and the towns around them —
              then the wider 518 by request. First categories: barbers, hair and
              nail salons, HVAC, plumbers, electricians, and auto repair.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-border py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="font-display text-headline">
            Own a shop? Be one of the first partners.
          </h2>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            The same assistant can answer your own shop phone, too. See it work
            on a fictional barbershop in the{" "}
            <Link
              href="/shop-line"
              className="text-primary underline underline-offset-4"
            >
              518 Shop Line demo
            </Link>
            , then email{" "}
            <a
              href={PILOT_MAILTO}
              className="font-mono text-primary underline-offset-4 hover:underline"
            >
              hello@albanyaiguy.com
            </a>{" "}
            to join the pilot.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <a href={PILOT_MAILTO}>Join the pilot</a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/">Back to home</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
