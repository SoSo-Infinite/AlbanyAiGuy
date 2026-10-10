"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  estimateMissedCalls,
  formatWholeDollars,
  MISSED_CALL_FIELDS,
  type MissedCallFieldKey,
} from "@/lib/missed-calls";
import { CONTACT_NAV_LABEL } from "@/lib/nav";

const FIELD_ORDER: MissedCallFieldKey[] = [
  "missedCallsPerWeek",
  "bookingPercent",
  "averageJobValue",
];

export function MissedCallCalculator({
  initial,
  idPrefix = "",
  showContactLink = true,
}: {
  initial: Record<MissedCallFieldKey, string>;
  /** Keeps field ids unique when this form sits under another element with the same ids. */
  idPrefix?: string;
  /** The standalone page links to contact. The /try hub keeps one contact link at the bottom. */
  showContactLink?: boolean;
}) {
  const [values, setValues] = useState(initial);
  const estimate = estimateMissedCalls(values);
  const invalidField = estimate.ok ? null : estimate.field;
  const resultId = `${idPrefix}missed-call-result`;
  const headingId = `${idPrefix}estimate-heading`;

  return (
    <div>
      <form
        method="get"
        action="/tools/missed-calls"
        className="rounded-xl border border-border bg-card p-5 sm:p-8"
      >
        <div className="grid gap-5">
          {FIELD_ORDER.map((field) => {
            const meta = MISSED_CALL_FIELDS[field];
            const inputId = `${idPrefix}${meta.id}`;
            return (
              <div key={field} className="grid gap-2">
                <Label htmlFor={inputId}>{meta.label}</Label>
                <Input
                  id={inputId}
                  name={meta.query}
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                  value={values[field]}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      [field]: event.target.value,
                    }))
                  }
                  aria-invalid={invalidField === field ? true : undefined}
                  aria-describedby={resultId}
                  className="min-h-11"
                />
              </div>
            );
          })}
          <Button type="submit" className="min-h-11 w-full sm:w-auto">
            Calculate
          </Button>
        </div>
      </form>

      <section aria-labelledby={headingId} className="mt-10">
        <h2 id={headingId} className="font-display text-headline">
          Estimated revenue missed
        </h2>
        <output
          id={resultId}
          htmlFor={FIELD_ORDER.map(
            (field) => `${idPrefix}${MISSED_CALL_FIELDS[field].id}`,
          ).join(" ")}
          aria-live="polite"
          aria-atomic="true"
          className="mt-4 block"
        >
          {estimate.ok ? (
            <EstimateView estimate={estimate} />
          ) : (
            <span className="block text-destructive">{estimate.message}</span>
          )}
        </output>
      </section>

      {showContactLink ? (
        <p className="mt-10">
          <Link
            href="/contact"
            className="inline-flex min-h-11 items-center rounded-sm underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
          >
            {CONTACT_NAV_LABEL}
          </Link>
        </p>
      ) : null}
    </div>
  );
}

function EstimateView({
  estimate,
}: {
  estimate: Extract<ReturnType<typeof estimateMissedCalls>, { ok: true }>;
}) {
  return (
    <>
      <span className="block font-display text-headline tabular-nums">
        {formatWholeDollars(estimate.monthlyDollars)}{" "}
        <span className="text-lg text-muted-foreground">a month</span>
      </span>
      <span className="mt-1 block text-lg tabular-nums">
        {formatWholeDollars(estimate.yearlyDollars)}{" "}
        <span className="text-muted-foreground">a year</span>
      </span>
      <span className="mt-4 block max-w-2xl text-muted-foreground">
        {estimate.math}
      </span>
      <span className="mt-3 block text-sm text-muted-foreground">
        {estimate.note}
      </span>
    </>
  );
}
