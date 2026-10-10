import { generateText, stepCountIs, tool } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";
import { type Msg, ruleReply } from "@/lib/shop-line/engine";
import {
  aiEnabled,
  checkRequest,
  createLimiter,
  dailyMax,
  MAX_BODY_BYTES,
} from "@/lib/shop-line/guard";
import {
  type Booking,
  makeRef,
  openSlots,
  SHOP,
  systemPrompt,
} from "@/lib/shop-line/shop";

export const runtime = "nodejs";
export const maxDuration = 20;

const MODEL = process.env.SHOP_LINE_MODEL || "openai/gpt-4.1-mini";

const limiter = createLimiter();

function postJson(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(req: Request) {
  const gate = checkRequest({
    method: req.method,
    contentType: req.headers.get("content-type"),
    contentLength: req.headers.get("content-length"),
    origin: req.headers.get("origin"),
    host: req.headers.get("x-forwarded-host") || req.headers.get("host"),
  });
  // A cross-site Origin (403 from the guard) never reaches the paid model, but
  // the visitor still gets the free rule engine, so a host-header mismatch can
  // never break the public demo.
  const crossSite = !gate.ok && gate.status === 403;
  if (!gate.ok && !crossSite) {
    return postJson({ ok: false, error: gate.error }, gate.status);
  }

  const text = await req.text();
  if (new TextEncoder().encode(text).length > MAX_BODY_BYTES) {
    return postJson({ ok: false, error: "That message is too long." }, 413);
  }

  let parsed: unknown = {};
  try {
    if (text.length > 0) parsed = JSON.parse(text);
  } catch {
    parsed = {};
  }
  const body = (parsed ?? {}) as {
    messages?: unknown;
    taken?: unknown;
  };
  const raw = Array.isArray(body.messages) ? body.messages : [];
  const messages: Msg[] = raw
    .filter(
      (m): m is Msg =>
        !!m &&
        typeof m === "object" &&
        ((m as Msg).role === "user" || (m as Msg).role === "assistant"),
    )
    .map((m) => ({
      role: m.role,
      content: String(m.content ?? "").slice(0, 400),
    }))
    .slice(-24);
  const taken = Array.isArray(body.taken)
    ? body.taken.map(String).slice(0, 20)
    : [];
  const slots = openSlots(new Date(), taken);

  if (!messages.length || messages.at(-1)?.role !== "user") {
    return postJson(
      { ok: false, error: "Say something to the shop first." },
      400,
    );
  }
  const userTurns = messages.filter((m) => m.role === "user").length;
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";

  if (
    aiEnabled(process.env) &&
    !crossSite &&
    userTurns <= 16 &&
    limiter.allowAi(ip, dailyMax(process.env))
  ) {
    try {
      let booking: Booking | undefined;
      const result = await generateText({
        model: MODEL,
        system: systemPrompt(slots),
        messages,
        maxOutputTokens: 180,
        temperature: 0.5,
        timeout: 12_000,
        stopWhen: stepCountIs(3),
        tools: {
          book_appointment: tool({
            description:
              "Book the caller into one of the open times. Only call when you have service, open slot id and first name.",
            inputSchema: z.object({
              slot_id: z
                .string()
                .describe(
                  "Exact id from the open times list, e.g. 2026-10-08T1:30PM",
                ),
              service: z.enum(
                SHOP.services.map((s) => s.label) as [string, ...string[]],
              ),
              first_name: z.string().min(1).max(30),
            }),
            execute: async ({ slot_id, service, first_name }) => {
              const slot = slots.find((s) => s.id === slot_id);
              if (!slot)
                return {
                  ok: false,
                  error: "That time is not open. Offer the open times instead.",
                };
              const svc =
                SHOP.services.find((s) => s.label === service) ??
                SHOP.services[0];
              const name = first_name.trim().split(/\s+/)[0];
              booking = {
                name,
                service: svc.label,
                price: svc.price,
                slot,
                ref: makeRef(slot, name),
              };
              return {
                ok: true,
                day: slot.dayLabel,
                time: slot.time,
                barber: slot.barber,
                ref: booking.ref,
              };
            },
          }),
        },
      });
      const reply = result.text.trim();
      if (reply)
        return postJson({
          ok: true,
          engine: "ai",
          reply,
          booking,
          slots,
        });
    } catch (err) {
      console.error("shop-line ai error", (err as Error)?.message);
    }
  }

  const { reply, booking } = ruleReply(messages, slots);
  return postJson({
    ok: true,
    engine: "basic",
    reply,
    booking,
    slots,
  });
}

export async function GET() {
  const slots = openSlots();
  return NextResponse.json({ ok: true, shop: SHOP.name, slots });
}
