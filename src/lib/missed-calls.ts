/**
 * Missed-call revenue estimate from the visitor's own numbers.
 * A month is 52/12 weeks and a year is 52 weeks. Dollar outputs round
 * half up to the nearest dollar. This file has no prices, packages, or offers.
 */

export const WEEKS_PER_YEAR = 52;
export const MONTHS_PER_YEAR = 12;

export const MAX_MISSED_CALLS_PER_WEEK = 10_000;
export const MAX_BOOKING_PERCENT = 100;
export const MAX_AVERAGE_JOB_VALUE = 1_000_000;

export const ESTIMATE_NOTE = "This is an estimate from your own numbers.";

export const MISSED_CALL_FIELDS = {
  missedCallsPerWeek: {
    id: "missed-calls",
    query: "calls",
    label: "Missed calls per week",
    defaultValue: "10",
    max: MAX_MISSED_CALLS_PER_WEEK,
  },
  bookingPercent: {
    id: "booking-percent",
    query: "percent",
    label: "Percent that would have booked",
    defaultValue: "30",
    max: MAX_BOOKING_PERCENT,
  },
  averageJobValue: {
    id: "average-job-value",
    query: "job",
    label: "Average job value ($)",
    defaultValue: "150",
    max: MAX_AVERAGE_JOB_VALUE,
  },
} as const;

export const MISSED_CALL_DEFAULTS = {
  missedCallsPerWeek: MISSED_CALL_FIELDS.missedCallsPerWeek.defaultValue,
  bookingPercent: MISSED_CALL_FIELDS.bookingPercent.defaultValue,
  averageJobValue: MISSED_CALL_FIELDS.averageJobValue.defaultValue,
} as const;

export type MissedCallFieldKey = keyof typeof MISSED_CALL_FIELDS;

export type RawNumber = string | number | null | undefined;

export type MissedCallInput = Record<MissedCallFieldKey, RawNumber>;

export type RejectCode = "blank" | "invalid" | "negative" | "huge";

export type MissedCallSuccess = {
  ok: true;
  missedCallsPerWeek: number;
  bookingPercent: number;
  averageJobValue: number;
  bookingsPerWeek: number;
  monthlyDollars: number;
  yearlyDollars: number;
  math: string;
  note: typeof ESTIMATE_NOTE;
};

export type MissedCallRejection = {
  ok: false;
  field: MissedCallFieldKey;
  code: RejectCode;
  message: string;
};

export type MissedCallResult = MissedCallSuccess | MissedCallRejection;

type Decimal = {
  /** Non-negative significand. */
  num: bigint;
  /** Digits after the decimal point, as written. */
  scale: number;
};

const FIELD_ORDER: MissedCallFieldKey[] = [
  "missedCallsPerWeek",
  "bookingPercent",
  "averageJobValue",
];

const UNSIGNED_NUMBER = /^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/;

const REJECT_MESSAGES: Record<
  MissedCallFieldKey,
  Record<RejectCode, string>
> = {
  missedCallsPerWeek: {
    blank: "Enter missed calls per week.",
    invalid: "Missed calls per week needs to be a number.",
    negative: "Missed calls per week cannot be negative.",
    huge: "Missed calls per week is too large to estimate. Use 10,000 or fewer.",
  },
  bookingPercent: {
    blank: "Enter the percent that would have booked.",
    invalid: "Percent that would have booked needs to be a number.",
    negative: "Percent that would have booked cannot be negative.",
    huge: "Percent that would have booked cannot be more than 100.",
  },
  averageJobValue: {
    blank: "Enter the average job value.",
    invalid: "Average job value needs to be a number.",
    negative: "Average job value cannot be negative.",
    huge: "Average job value is too large to estimate. Use $1,000,000 or less.",
  },
};

/** Whole dollars with a thousands separator, for example "$1,950". */
export function formatWholeDollars(amount: number): string {
  const negative = amount < 0;
  const whole = Math.abs(Math.trunc(amount));
  const body = groupThousands(whole.toString());
  return `${negative ? "-" : ""}$${body}`;
}

export function estimateMissedCalls(input: MissedCallInput): MissedCallResult {
  const parsed: Partial<Record<MissedCallFieldKey, Decimal>> = {};

  for (const field of FIELD_ORDER) {
    const result = parseRaw(input[field], MISSED_CALL_FIELDS[field].max);
    if (!result.ok) {
      return {
        ok: false,
        field,
        code: result.code,
        message: REJECT_MESSAGES[field][result.code],
      };
    }
    parsed[field] = result.decimal;
  }

  const calls = parsed.missedCallsPerWeek;
  const percent = parsed.bookingPercent;
  const job = parsed.averageJobValue;
  if (!calls || !percent || !job) {
    return {
      ok: false,
      field: "missedCallsPerWeek",
      code: "invalid",
      message: REJECT_MESSAGES.missedCallsPerWeek.invalid,
    };
  }

  const scale = calls.scale + percent.scale + job.scale;
  const product = calls.num * percent.num * job.num;
  const moneyScale = BigInt(10) ** BigInt(scale);
  const yearlyNumerator = product * BigInt(WEEKS_PER_YEAR);
  const yearlyDivisor = moneyScale * BigInt(100);
  const monthlyDivisor = yearlyDivisor * BigInt(MONTHS_PER_YEAR);

  const yearly = divRoundHalfUp(yearlyNumerator, yearlyDivisor);
  const monthly = divRoundHalfUp(yearlyNumerator, monthlyDivisor);
  const yearlyDollars = toSafeNumber(yearly);
  const monthlyDollars = toSafeNumber(monthly);
  if (yearlyDollars == null || monthlyDollars == null) {
    return {
      ok: false,
      field: "averageJobValue",
      code: "huge",
      message: REJECT_MESSAGES.averageJobValue.huge,
    };
  }

  const bookingScale = calls.scale + percent.scale + 2;
  const bookings: Decimal = {
    num: calls.num * percent.num,
    scale: bookingScale,
  };

  return {
    ok: true,
    missedCallsPerWeek: toNumber(calls),
    bookingPercent: toNumber(percent),
    averageJobValue: toNumber(job),
    bookingsPerWeek: toNumber(bookings),
    monthlyDollars,
    yearlyDollars,
    math: describe({
      calls,
      percent,
      job,
      monthly,
      yearly,
      monthlyExact: yearlyNumerator % monthlyDivisor === BigInt(0),
      yearlyExact: yearlyNumerator % yearlyDivisor === BigInt(0),
    }),
    note: ESTIMATE_NOTE,
  };
}

function describe(input: {
  calls: Decimal;
  percent: Decimal;
  job: Decimal;
  monthly: bigint;
  yearly: bigint;
  monthlyExact: boolean;
  yearlyExact: boolean;
}): string {
  const callsText = formatPlain(input.calls, true);
  const percentText = formatPlain(input.percent, true);
  const jobText = formatJob(input.job);
  const callNoun = isOne(input.calls) ? "missed call" : "missed calls";
  const monthLead = input.monthlyExact ? "" : "about ";
  const yearLead = input.yearlyExact ? "" : "about ";
  const monthlyText = formatWholeDollars(Number(input.monthly));
  const yearlyText = formatWholeDollars(Number(input.yearly));

  return [
    `${callsText} ${callNoun} a week, and ${percentText}% of them would have booked, at ${jobText} a job.`,
    `That is ${callsText} × ${percentText}% × ${jobText} each week.`,
    `A month counts as 52 ÷ 12 weeks, so ${monthLead}${monthlyText} a month.`,
    `A year is 52 weeks, so ${yearLead}${yearlyText} a year.`,
  ].join(" ");
}

function parseRaw(
  raw: RawNumber,
  max: number,
): { ok: true; decimal: Decimal } | { ok: false; code: RejectCode } {
  if (typeof raw === "number") {
    if (!Number.isFinite(raw)) return { ok: false, code: "invalid" };
    if (raw < 0) return { ok: false, code: "negative" };
    const text = raw === 0 ? "0" : raw.toFixed(8).replace(/\.?0+$/, "");
    const decimal = decimalFromPlain(text);
    if (exceeds(decimal, max)) return { ok: false, code: "huge" };
    return { ok: true, decimal };
  }

  if (typeof raw !== "string") {
    return { ok: false, code: "blank" };
  }

  const trimmed = raw.trim();
  if (trimmed === "") return { ok: false, code: "blank" };
  if (trimmed.length > 40) {
    return { ok: false, code: looksNumeric(trimmed) ? "huge" : "invalid" };
  }

  const stripped = stripAffixes(trimmed);
  if (!stripped.ok) return stripped;
  if (!UNSIGNED_NUMBER.test(stripped.body)) {
    return { ok: false, code: "invalid" };
  }
  if (stripped.negative) return { ok: false, code: "negative" };

  const decimal = decimalFromPlain(stripped.body.replace(/,/g, ""));
  if (exceeds(decimal, max)) return { ok: false, code: "huge" };
  return { ok: true, decimal };
}

function stripAffixes(
  input: string,
):
  | { ok: true; body: string; negative: boolean }
  | { ok: false; code: "invalid" } {
  let body = input;
  let negative = false;
  let dollar = false;

  for (let pass = 0; pass < 2; pass++) {
    if (!negative && body.startsWith("-")) {
      negative = true;
      body = body.slice(1).trim();
      continue;
    }
    if (!dollar && body.startsWith("$")) {
      dollar = true;
      body = body.slice(1).trim();
      continue;
    }
    break;
  }

  if (body.endsWith("%")) body = body.slice(0, -1).trim();
  if (body.includes("$") || body.includes("%") || body.includes("-")) {
    return { ok: false, code: "invalid" };
  }
  return { ok: true, body, negative };
}

function looksNumeric(input: string): boolean {
  const stripped = input.replace(/[$,%\s-]/g, "");
  return /^\d+(\.\d+)?$/.test(stripped);
}

function decimalFromPlain(plain: string): Decimal {
  const [wholeRaw, frac = ""] = plain.split(".");
  const whole = wholeRaw.replace(/^0+(?=\d)/, "") || "0";
  const digits = `${whole}${frac}`.replace(/^0+(?=\d)/, "") || "0";
  return { num: BigInt(digits), scale: frac.length };
}

function exceeds(decimal: Decimal, max: number): boolean {
  const limit = BigInt(max) * BigInt(10) ** BigInt(decimal.scale);
  return decimal.num > limit;
}

/** Round half up (away from zero is the same here: every value is >= 0). */
function divRoundHalfUp(numerator: bigint, denominator: bigint): bigint {
  const quotient = numerator / denominator;
  const remainder = numerator % denominator;
  if (remainder * BigInt(2) >= denominator) return quotient + BigInt(1);
  return quotient;
}

function toSafeNumber(value: bigint): number | null {
  if (value > BigInt(Number.MAX_SAFE_INTEGER)) return null;
  return Number(value);
}

function toNumber(decimal: Decimal): number {
  return Number(decimal.num) / 10 ** decimal.scale;
}

function isOne(decimal: Decimal): boolean {
  return decimal.num === BigInt(10) ** BigInt(decimal.scale);
}

function formatPlain(decimal: Decimal, trimFraction: boolean): string {
  const digits = decimal.num.toString().padStart(decimal.scale + 1, "0");
  const splitAt = digits.length - decimal.scale;
  const whole = digits.slice(0, splitAt);
  let frac = decimal.scale === 0 ? "" : digits.slice(splitAt);
  if (trimFraction) frac = frac.replace(/0+$/, "");
  const wholeText = groupThousands(whole);
  return frac ? `${wholeText}.${frac}` : wholeText;
}

function formatJob(decimal: Decimal): string {
  if (decimal.scale === 0) return `$${formatPlain(decimal, true)}`;
  const show = Math.max(decimal.scale, 2);
  const extended: Decimal = {
    num: decimal.num * BigInt(10) ** BigInt(show - decimal.scale),
    scale: show,
  };
  return `$${formatPlain(extended, false)}`;
}

function groupThousands(integerDigits: string): string {
  const trimmed = integerDigits.replace(/^0+(?=\d)/, "") || "0";
  return trimmed.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
