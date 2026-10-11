import {
  estimateMissedCalls,
  formatWholeDollars,
  type MissedCallFieldKey,
  type MissedCallResult,
} from "@/lib/missed-calls";
import { spokenNumberToRaw } from "./numbers";

export const MISSED_QUESTIONS = {
  calls: "How many calls do you miss in a week?",
  percent: "What percent of those would have booked?",
  job: "What is the average value of a job, in dollars?",
} as const;

export type MissedStep = "calls" | "percent" | "job" | "done";

const FIELD_FOR: Record<Exclude<MissedStep, "done">, MissedCallFieldKey> = {
  calls: "missedCallsPerWeek",
  percent: "bookingPercent",
  job: "averageJobValue",
};

export function missedFieldFor(
  step: Exclude<MissedStep, "done">,
): MissedCallFieldKey {
  return FIELD_FOR[step];
}

/** Range check for one field. Other fields are filled with a valid stand-in. */
export function missedFieldError(
  field: MissedCallFieldKey,
  raw: string,
): string | null {
  const input = {
    missedCallsPerWeek: "1",
    bookingPercent: "1",
    averageJobValue: "1",
  };
  input[field] = raw;
  const result = estimateMissedCalls(input);
  if (!result.ok && result.field === field) return result.message;
  return null;
}

export function missedCallsResult(
  calls: string,
  percent: string,
  job: string,
): MissedCallResult {
  return estimateMissedCalls({
    missedCallsPerWeek: spokenNumberToRaw(calls) ?? calls.trim(),
    bookingPercent: spokenNumberToRaw(percent) ?? percent.trim(),
    averageJobValue: spokenNumberToRaw(job) ?? job.trim(),
  });
}

/** Same terms the calculator shows: month, year, math, and the estimate note. */
export function speakMissed(result: MissedCallResult): string {
  if (!result.ok) return result.message;
  return [
    `${formatWholeDollars(result.monthlyDollars)} a month.`,
    `${formatWholeDollars(result.yearlyDollars)} a year.`,
    result.math,
    result.note,
  ].join(" ");
}
