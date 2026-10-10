import assert from "node:assert/strict";
import test from "node:test";
import {
  ESTIMATE_NOTE,
  estimateMissedCalls,
  MISSED_CALL_DEFAULTS,
  type MissedCallResult,
} from "../src/lib/missed-calls.ts";

const DEFAULT_MATH =
  "10 missed calls a week, and 30% of them would have booked, at $150 a job. That is 10 × 30% × $150 each week. A month counts as 52 ÷ 12 weeks, so $1,950 a month. A year is 52 weeks, so $23,400 a year.";

function expectOk(result: MissedCallResult) {
  if (!result.ok) assert.fail(result.message);
  return result;
}

function expectNo(result: MissedCallResult) {
  if (result.ok) assert.fail("expected a rejected estimate");
  return result;
}

test("defaults: 10 calls, 30%, $150 use 52/12 weeks and 52 weeks", () => {
  const result = expectOk(
    estimateMissedCalls({
      missedCallsPerWeek: MISSED_CALL_DEFAULTS.missedCallsPerWeek,
      bookingPercent: MISSED_CALL_DEFAULTS.bookingPercent,
      averageJobValue: MISSED_CALL_DEFAULTS.averageJobValue,
    }),
  );
  // 10 × 0.30 × 150 = $450 a week. × 52/12 = $1,950. × 52 = $23,400.
  assert.equal(result.monthlyDollars, 1950);
  assert.equal(result.yearlyDollars, 23400);
  assert.equal(result.bookingsPerWeek, 3);
  assert.equal(result.math, DEFAULT_MATH);
  assert.equal(result.note, "This is an estimate from your own numbers.");
  assert.equal(result.note, ESTIMATE_NOTE);
});

test("rounds half up when a month lands on .5", () => {
  // 3 × 50% × $1 = $1.50 a week. × 52/12 = $6.50 → $7. × 52 = $78.
  const result = expectOk(
    estimateMissedCalls({
      missedCallsPerWeek: "3",
      bookingPercent: "50",
      averageJobValue: "1",
    }),
  );
  assert.equal(result.monthlyDollars, 7);
  assert.equal(result.yearlyDollars, 78);
  assert.match(result.math, /about \$7 a month/);
  assert.match(result.math, /\$78 a year/);
});

test("rounds a fractional percent to whole dollars", () => {
  // 1 × 33% × $10 = $3.30 a week. × 52/12 = $14.30 → $14. × 52 = $171.60 → $172.
  const result = expectOk(
    estimateMissedCalls({
      missedCallsPerWeek: 1,
      bookingPercent: 33,
      averageJobValue: 10,
    }),
  );
  assert.equal(result.monthlyDollars, 14);
  assert.equal(result.yearlyDollars, 172);
  assert.match(result.math, /1 missed call a week/);
});

test("rounds 606.666... dollars a month up to 607", () => {
  // 7 × 25% × $80 = $140 a week. × 52/12 = $606.666... → $607. × 52 = $7,280.
  const result = expectOk(
    estimateMissedCalls({
      missedCallsPerWeek: "7",
      bookingPercent: "25",
      averageJobValue: "80",
    }),
  );
  assert.equal(result.monthlyDollars, 607);
  assert.equal(result.yearlyDollars, 7280);
  assert.match(result.math, /about \$607 a month/);
  assert.match(result.math, /\$7,280 a year/);
});

test("a tiny estimate can round to $0 a month and $1 a year", () => {
  const result = expectOk(
    estimateMissedCalls({
      missedCallsPerWeek: "1",
      bookingPercent: "1",
      averageJobValue: "1",
    }),
  );
  assert.equal(result.monthlyDollars, 0);
  assert.equal(result.yearlyDollars, 1);
});

test("zero calls, zero percent, and a zero job value are $0", () => {
  for (const input of [
    { missedCallsPerWeek: "0", bookingPercent: "30", averageJobValue: "150" },
    { missedCallsPerWeek: "10", bookingPercent: "0", averageJobValue: "150" },
    { missedCallsPerWeek: "10", bookingPercent: "30", averageJobValue: "0" },
  ]) {
    const result = expectOk(estimateMissedCalls(input));
    assert.equal(result.monthlyDollars, 0);
    assert.equal(result.yearlyDollars, 0);
  }
});

test("blank and whitespace inputs are rejected", () => {
  const blank = expectNo(
    estimateMissedCalls({
      missedCallsPerWeek: "",
      bookingPercent: "30",
      averageJobValue: "150",
    }),
  );
  assert.equal(blank.field, "missedCallsPerWeek");
  assert.equal(blank.code, "blank");
  assert.equal(blank.message, "Enter missed calls per week.");

  const spaces = expectNo(
    estimateMissedCalls({
      missedCallsPerWeek: "10",
      bookingPercent: "   ",
      averageJobValue: "150",
    }),
  );
  assert.equal(spaces.field, "bookingPercent");
  assert.equal(spaces.code, "blank");

  const missing = expectNo(
    estimateMissedCalls({
      missedCallsPerWeek: "10",
      bookingPercent: "30",
      averageJobValue: null,
    }),
  );
  assert.equal(missing.field, "averageJobValue");
  assert.equal(missing.code, "blank");
});

test("negative numbers are rejected", () => {
  const calls = expectNo(
    estimateMissedCalls({
      missedCallsPerWeek: "-4",
      bookingPercent: "30",
      averageJobValue: "150",
    }),
  );
  assert.equal(calls.code, "negative");
  assert.equal(calls.field, "missedCallsPerWeek");

  const job = expectNo(
    estimateMissedCalls({
      missedCallsPerWeek: "10",
      bookingPercent: "30",
      averageJobValue: -15,
    }),
  );
  assert.equal(job.code, "negative");
  assert.equal(job.field, "averageJobValue");
});

test("huge numbers and percent over 100 are rejected", () => {
  const calls = expectNo(
    estimateMissedCalls({
      missedCallsPerWeek: "10001",
      bookingPercent: "30",
      averageJobValue: "150",
    }),
  );
  assert.equal(calls.code, "huge");
  assert.match(calls.message, /10,000 or fewer/);

  const atCap = expectOk(
    estimateMissedCalls({
      missedCallsPerWeek: "10000",
      bookingPercent: "100",
      averageJobValue: "1000000",
    }),
  );
  assert.equal(Number.isInteger(atCap.monthlyDollars), true);
  assert.equal(Number.isInteger(atCap.yearlyDollars), true);

  const overCap = expectNo(
    estimateMissedCalls({
      missedCallsPerWeek: "10",
      bookingPercent: "30",
      averageJobValue: "1000000.01",
    }),
  );
  assert.equal(overCap.code, "huge");
  assert.equal(overCap.field, "averageJobValue");

  const percent = expectNo(
    estimateMissedCalls({
      missedCallsPerWeek: "10",
      bookingPercent: "101",
      averageJobValue: "150",
    }),
  );
  assert.equal(percent.code, "huge");
  assert.equal(percent.field, "bookingPercent");
  assert.match(percent.message, /cannot be more than 100/);
});

test("words, NaN, and Infinity are not numbers", () => {
  const words = expectNo(
    estimateMissedCalls({
      missedCallsPerWeek: "ten",
      bookingPercent: "30",
      averageJobValue: "150",
    }),
  );
  assert.equal(words.code, "invalid");

  const nan = expectNo(
    estimateMissedCalls({
      missedCallsPerWeek: Number.NaN,
      bookingPercent: 30,
      averageJobValue: 150,
    }),
  );
  assert.equal(nan.code, "invalid");

  const infinite = expectNo(
    estimateMissedCalls({
      missedCallsPerWeek: 10,
      bookingPercent: Number.POSITIVE_INFINITY,
      averageJobValue: 150,
    }),
  );
  assert.equal(infinite.code, "invalid");
  assert.equal(infinite.field, "bookingPercent");
});

test("dollar signs, commas, percent signs, and surrounding spaces parse", () => {
  const result = expectOk(
    estimateMissedCalls({
      missedCallsPerWeek: "  2 ",
      bookingPercent: "10%",
      averageJobValue: "$1,500",
    }),
  );
  // 2 × 10% × $1,500 = $300 a week. × 52/12 = $1,300. × 52 = $15,600.
  assert.equal(result.monthlyDollars, 1300);
  assert.equal(result.yearlyDollars, 15600);
  assert.match(result.math, /\$1,500/);
});
