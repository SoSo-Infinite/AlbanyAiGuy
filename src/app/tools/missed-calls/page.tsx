import type { Metadata } from "next";
import { MissedCallCalculator } from "@/components/missed-call-calculator";
import { Badge } from "@/components/ui/badge";
import {
  MISSED_CALL_FIELDS,
  type MissedCallFieldKey,
} from "@/lib/missed-calls";

const TITLE = "Missed-call cost calculator";
const DESCRIPTION =
  "Estimate monthly and yearly revenue from missed calls using your own numbers: calls per week, the percent that would have booked, and average job value.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/tools/missed-calls" },
  openGraph: {
    type: "website",
    siteName: "Albany AI Guy",
    url: "https://albanyaiguy.com/tools/missed-calls",
    title: `${TITLE} | Albany AI Guy`,
    description: DESCRIPTION,
    images: [
      { url: "/og.jpg", width: 1200, height: 630, alt: "Albany AI Guy" },
    ],
  },
};

type SearchParams = Promise<{
  [key: string]: string | string[] | undefined;
}>;

function readField(
  params: { [key: string]: string | string[] | undefined },
  field: MissedCallFieldKey,
): string {
  const raw = params[MISSED_CALL_FIELDS[field].query];
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value ?? MISSED_CALL_FIELDS[field].defaultValue;
}

export default async function MissedCallsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const initial = {
    missedCallsPerWeek: readField(params, "missedCallsPerWeek"),
    bookingPercent: readField(params, "bookingPercent"),
    averageJobValue: readField(params, "averageJobValue"),
  };

  return (
    <main>
      <section className="relative overflow-hidden pt-12 pb-10 sm:pt-20 sm:pb-14">
        <div className="pointer-events-none absolute inset-0 grid-bg" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <Badge>Albany, NY · 518 · Calculator</Badge>
          <h1 className="mt-5 max-w-3xl font-display text-display">
            Missed-call cost calculator
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
            Enter how many calls you miss in a week, what percent of them would
            have booked, and the average value of a job. The figure below uses
            only those numbers.
          </p>
        </div>
      </section>

      <section className="border-t border-border py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <MissedCallCalculator
            key={`${initial.missedCallsPerWeek}\n${initial.bookingPercent}\n${initial.averageJobValue}`}
            initial={initial}
          />
        </div>
      </section>
    </main>
  );
}
