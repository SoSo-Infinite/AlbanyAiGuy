import type { Metadata } from "next";
import Link from "next/link";
import { PageBand } from "@/components/motion/page-band";
import { PageTransition } from "@/components/motion/page-transition";
import { Reveal } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";
import { PRIVACY_ITEMS } from "@/lib/privacy-content";
import { socialMeta } from "@/lib/social";

const TITLE = "Privacy";
const DESCRIPTION =
  "The privacy promises already made across this site, in one place: calls aren't recorded, the demos don't store anything, and requests only go to the shop you chose.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/privacy" },
  ...socialMeta({
    type: "website",
    siteName: "Albany AI Guy",
    url: "https://albanyaiguy.com/privacy",
    title: `${TITLE} | Albany AI Guy`,
    description: DESCRIPTION,
    image: { url: "/og.jpg", width: 1200, height: 630, alt: "Albany AI Guy" },
  }),
};

export default function PrivacyPage() {
  return (
    <PageTransition>
      <main className="site-main">
        <PageBand />
        <Reveal
          as="section"
          className="relative overflow-hidden pt-12 pb-10 sm:pt-20 sm:pb-14"
        >
          <div className="pointer-events-none absolute inset-0 grid-bg" />
          <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
            <Badge>Albany, NY · 518 · Privacy</Badge>
            <h1 className="mt-5 max-w-3xl font-display text-display">
              Privacy
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
              The privacy promises made across this site, in one place. Each one
              links to the page it comes from.
            </p>
          </div>
        </Reveal>

        <Reveal
          as="section"
          aria-label="Privacy by page"
          className="border-t border-border py-12 sm:py-16"
        >
          <Reveal
            as="div"
            stagger
            className="mx-auto grid max-w-6xl gap-4 px-4 sm:px-6 lg:grid-cols-2"
          >
            {PRIVACY_ITEMS.map((item) => (
              <Reveal
                as="div"
                key={item.id}
                id={item.id}
                className="scroll-mt-20 rounded-xl border border-border bg-card p-5 sm:p-6"
              >
                <h2 className="font-display text-title">{item.title}</h2>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
                  {item.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
                <p className="mt-4 text-sm">
                  <Link
                    href={item.source}
                    className="text-primary underline underline-offset-4"
                  >
                    From {item.source.split("#")[0]}
                  </Link>
                </p>
              </Reveal>
            ))}
          </Reveal>
          <p className="mx-auto mt-8 max-w-6xl px-4 text-sm text-muted-foreground sm:px-6">
            Questions:{" "}
            <a
              href="mailto:hello@albanyaiguy.com"
              className="font-mono text-primary underline underline-offset-4"
            >
              hello@albanyaiguy.com
            </a>
          </p>
        </Reveal>
      </main>
    </PageTransition>
  );
}
