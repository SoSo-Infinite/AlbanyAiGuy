"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Booking, Slot } from "@/lib/shop-line/shop";
import s from "./shop-line.module.css";

type Msg = { role: "user" | "assistant"; content: string };
type OwnerText = { at: string; body: string };

const SHOP_NAME = "Chairside Barber Co.";
const GREETING = `Thanks for calling ${SHOP_NAME}, this is the front desk. Marco's mid-cut, but I can get you booked. What can I do for you?`;
const TRIAL_MAIL =
  "mailto:hello@albanyaiguy.com?subject=518%20Shop%20Line%20-%2014-day%20trial&body=Hi%20Chad%2C%20I%20tried%20the%20Shop%20Line%20demo.%20My%20shop%20is%3A%20";

// Minimal typing for the browser speech API (not in lib.dom for all targets).
type SR = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult:
    | ((e: {
        results: ArrayLike<
          ArrayLike<{ transcript: string }> & { isFinal: boolean }
        >;
      }) => void)
    | null;
  onend: (() => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

function getSR(): (new () => SR) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SR;
    webkitSpeechRecognition?: new () => SR;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

function pickVoice(): SpeechSynthesisVoice | undefined {
  if (typeof window === "undefined" || !window.speechSynthesis)
    return undefined;
  const voices = window.speechSynthesis
    .getVoices()
    .filter((v) => v.lang?.startsWith("en"));
  const prefs = [
    /Ava/i,
    /Samantha/i,
    /Aria.*Natural/i,
    /Jenny.*Natural/i,
    /Google US English/i,
    /Allison/i,
    /Zira/i,
  ];
  for (const p of prefs) {
    const v =
      voices.find((x) => p.test(x.name) && x.lang.startsWith("en-US")) ??
      voices.find((x) => p.test(x.name));
    if (v) return v;
  }
  return voices.find((v) => v.lang === "en-US") ?? voices[0];
}

function clock() {
  return new Date().toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function ShopLineDemo() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: GREETING },
  ]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [taken, setTaken] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [live, setLive] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [interim, setInterim] = useState("");
  const [booking, setBooking] = useState<Booking | null>(null);
  const [ownerTexts, setOwnerTexts] = useState<OwnerText[]>([]);
  const [banner, setBanner] = useState<string | null>(null);
  const [view, setView] = useState<"caller" | "owner">("caller");
  const [voiceOK, setVoiceOK] = useState(false);
  const [seconds, setSeconds] = useState(0);
  // Lock-screen clock is client-only: rendering clock() on the server (UTC) and
  // again in the browser caused a hydration mismatch (React #418).
  const [lockTime, setLockTime] = useState("");

  const srRef = useRef<SR | null>(null);
  const liveRef = useRef(false);
  const msgsRef = useRef<Msg[]>(messages);
  const scrollRef = useRef<HTMLDivElement>(null);
  msgsRef.current = messages;

  useEffect(() => {
    setVoiceOK(
      !!getSR() && typeof window !== "undefined" && "speechSynthesis" in window,
    );
    window.speechSynthesis?.getVoices();
    fetch("/api/shop-line")
      .then((r) => r.json())
      .then((d) => d?.slots && setSlots(d.slots))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLockTime(clock());
    const id = setInterval(() => setLockTime(clock()), 30_000);
    return () => clearInterval(id);
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll when the transcript changes
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, interim, thinking]);

  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => setSeconds((x) => x + 1), 1000);
    return () => clearInterval(id);
  }, [live]);

  const stopListening = useCallback(() => {
    srRef.current?.abort();
    srRef.current = null;
    setListening(false);
    setInterim("");
  }, []);

  const hangUp = useCallback(() => {
    liveRef.current = false;
    setLive(false);
    stopListening();
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }, [stopListening]);

  const speak = useCallback((text: string, after?: () => void) => {
    const synth =
      typeof window !== "undefined" ? window.speechSynthesis : undefined;
    if (!synth || !liveRef.current) {
      after?.();
      return;
    }
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const v = pickVoice();
    if (v) u.voice = v;
    u.rate = 1.04;
    u.pitch = 1;
    setSpeaking(true);
    u.onend = () => {
      setSpeaking(false);
      after?.();
    };
    u.onerror = () => {
      setSpeaking(false);
      after?.();
    };
    synth.speak(u);
  }, []);

  const send = useCallback(
    async (text: string) => {
      const clean = text.trim();
      if (!clean || thinking) return;
      const next: Msg[] = [
        ...msgsRef.current,
        { role: "user", content: clean },
      ];
      setMessages(next);
      setInput("");
      setThinking(true);
      let reply =
        "Sorry, the line cut out for a second. Could you say that again?";
      let booked: Booking | undefined;
      try {
        const r = await fetch("/api/shop-line", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: next, taken }),
        });
        const d = await r.json();
        if (d?.reply) reply = d.reply;
        if (d?.slots) setSlots(d.slots);
        booked = d?.booking;
      } catch {}
      setThinking(false);
      setMessages((m) => [...m, { role: "assistant", content: reply }]);

      if (booked) {
        const b = booked;
        setBooking(b);
        setTaken((t) => [...t, b.slot.id]);
        const day = b.slot.dayLabel === "today" ? "Today" : "Tomorrow";
        const ownerBody = `New booking: ${b.name} · ${b.service} · ${day} ${b.slot.time} with ${b.slot.barber}. Booked by your AI front desk while you were cutting. Ref ${b.ref}`;
        setTimeout(() => {
          setOwnerTexts((o) => [{ at: clock(), body: ownerBody }, ...o]);
          setBanner(ownerBody);
          setTimeout(() => setBanner(null), 6500);
        }, 900);
      }
      speak(reply, () => {
        if (booked) {
          setTimeout(() => hangUp(), 400);
        } else if (liveRef.current) {
          listenRef.current?.();
        }
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [thinking, taken, speak, hangUp],
  );

  const listen = useCallback(() => {
    const Ctor = getSR();
    if (!Ctor || !liveRef.current) return;
    stopListening();
    const sr = new Ctor();
    sr.lang = "en-US";
    sr.interimResults = true;
    sr.continuous = false;
    let finalText = "";
    sr.onresult = (e) => {
      let t = "";
      for (let i = 0; i < e.results.length; i++) {
        t += e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText = t;
      }
      setInterim(t);
    };
    sr.onerror = (e) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        hangUp();
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            content:
              "I can't hear you, the mic is blocked. You can type below instead.",
          },
        ]);
      }
    };
    sr.onend = () => {
      setListening(false);
      setInterim("");
      srRef.current = null;
      if (!liveRef.current) return;
      if (finalText.trim()) sendRef.current?.(finalText);
      else setTimeout(() => liveRef.current && listenRef.current?.(), 250);
    };
    srRef.current = sr;
    setListening(true);
    try {
      sr.start();
    } catch {
      setListening(false);
    }
  }, [hangUp, stopListening]);

  const sendRef = useRef(send);
  const listenRef = useRef(listen);
  sendRef.current = send;
  listenRef.current = listen;

  const startCall = () => {
    if (live) return hangUp();
    setSeconds(0);
    liveRef.current = true;
    setLive(true);
    const last = msgsRef.current.at(-1);
    const opener =
      msgsRef.current.length === 1 || booking
        ? GREETING
        : last?.role === "assistant"
          ? last.content
          : GREETING;
    if (booking) {
      setBooking(null);
      setMessages([{ role: "assistant", content: GREETING }]);
    }
    speak(opener, () => listen());
  };

  const reset = () => {
    hangUp();
    setBooking(null);
    setMessages([{ role: "assistant", content: GREETING }]);
  };

  const todaySlots = slots.slice(0, 4);
  const mm = String(Math.floor(seconds / 60)).padStart(1, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div className={s.page}>
      <header className={s.top}>
        <a href="/" className={s.brand} aria-label="Albany AI Guy home">
          <span className={s.mark}>A</span>
          <span>
            Albany AI Guy <span className={s.dim}>· 518 Shop Line</span>
          </span>
        </a>
        <span className={s.demoPill}>Live demo</span>
      </header>

      <section className={s.hero}>
        <p className={s.kicker}>AI front desk for 518 shops</p>
        <h1 className={s.h1}>
          Your phone rings mid-cut.
          <br />
          <span className={s.grad}>It still gets booked.</span>
        </h1>
        <p className={s.sub}>
          Call the demo shop below. Talk or type like a customer. The AI front
          desk offers real open times, books you, and texts the owner.
        </p>
      </section>

      <div className={s.seg} role="tablist" aria-label="Choose a side">
        <button
          role="tab"
          aria-selected={view === "caller"}
          className={view === "caller" ? s.segOn : s.segBtn}
          onClick={() => setView("caller")}
          type="button"
        >
          Customer calling
        </button>
        <button
          role="tab"
          aria-selected={view === "owner"}
          className={view === "owner" ? s.segOn : s.segBtn}
          onClick={() => setView("owner")}
          type="button"
        >
          Owner&apos;s phone{" "}
          {ownerTexts.length > 0 && (
            <span className={s.badge}>{ownerTexts.length}</span>
          )}
        </button>
      </div>

      <main className={s.stage}>
        <section
          className={`${s.card} ${view === "caller" ? s.show : s.hideMobile}`}
          aria-label="Customer call"
        >
          <div className={s.callHead}>
            <div className={s.avatar} aria-hidden>
              ✂
            </div>
            <div className={s.callWho}>
              <strong>{SHOP_NAME}</strong>
              <span className={s.dim}>
                {live
                  ? listening
                    ? "Listening…"
                    : speaking
                      ? "Speaking…"
                      : thinking
                        ? "Checking the book…"
                        : `On call ${mm}:${ss}`
                  : "Fictional demo shop · AI front desk"}
              </span>
            </div>
            {live && (
              <span
                className={`${s.dot} ${listening ? s.dotOn : ""}`}
                aria-hidden
              />
            )}
          </div>

          <div className={s.log} ref={scrollRef} aria-live="polite">
            {messages.map((m, i) => (
              <div
                key={`${i}-${m.content.slice(0, 8)}`}
                className={m.role === "user" ? s.me : s.them}
              >
                {m.content}
              </div>
            ))}
            {interim && <div className={`${s.me} ${s.ghost}`}>{interim}</div>}
            {thinking && (
              <output
                className={`${s.them} ${s.typing}`}
                aria-label="Front desk is typing"
              >
                <i />
                <i />
                <i />
              </output>
            )}
            {booking && (
              <div className={s.confirm}>
                <div className={s.check} aria-hidden>
                  ✓
                </div>
                <div>
                  <strong>Booked · {booking.ref}</strong>
                  <p>
                    {booking.service} ·{" "}
                    {booking.slot.dayLabel === "today" ? "Today" : "Tomorrow"}{" "}
                    {booking.slot.time} with {booking.slot.barber}
                  </p>
                  <p className={s.sms}>
                    Text to customer: “{SHOP_NAME}: You&apos;re booked,{" "}
                    {booking.name}. {booking.service}, {booking.slot.dayLabel}{" "}
                    {booking.slot.time}. Reply C to cancel.”
                  </p>
                </div>
              </div>
            )}
          </div>

          {!booking && todaySlots.length > 0 && (
            <fieldset className={s.chips} aria-label="Open times">
              <span className={s.dim}>Open {todaySlots[0].dayLabel}:</span>
              {todaySlots
                .filter((x) => x.dayLabel === todaySlots[0].dayLabel)
                .map((x) => (
                  <button
                    key={x.id}
                    type="button"
                    className={s.chip}
                    onClick={() => send(`Can I get ${x.time} ${x.dayLabel}?`)}
                  >
                    {x.time.replace(":00", "")}
                  </button>
                ))}
            </fieldset>
          )}

          <div className={s.controls}>
            {voiceOK && (
              <button
                type="button"
                onClick={startCall}
                className={live ? s.hang : s.call}
                aria-label={live ? "Hang up" : "Call the shop with your voice"}
              >
                {live ? "End call" : booking ? "Call again" : "Call the shop"}
              </button>
            )}
            <form
              className={s.typeRow}
              onSubmit={(e) => {
                e.preventDefault();
                if (live) stopListening();
                send(input);
              }}
            >
              <input
                className={s.input}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  voiceOK
                    ? "…or type: “Can I get a fade today?”"
                    : "Type: “Can I get a fade today?”"
                }
                aria-label="Message the shop"
                maxLength={300}
              />
              <button
                type="submit"
                className={s.sendBtn}
                disabled={!input.trim() || thinking}
                aria-label="Send"
              >
                ↑
              </button>
            </form>
          </div>
        </section>

        <section
          className={`${s.card} ${s.owner} ${view === "owner" ? s.show : s.hideMobile}`}
          aria-label="Owner's phone"
        >
          <div className={s.lock}>
            <span className={s.lockTime}>{lockTime}</span>
            <span className={s.dim}>
              Marco&apos;s phone · in his pocket, mid-cut
            </span>
          </div>
          {ownerTexts.length === 0 ? (
            <div className={s.empty}>
              <p>No missed calls.</p>
              <p className={s.dim}>
                Book a time as the customer and watch the owner&apos;s text land
                here.
              </p>
            </div>
          ) : (
            <ul className={s.notes}>
              {ownerTexts.map((t, i) => (
                <li key={`${t.at}-${i}`} className={s.note}>
                  <div className={s.noteHead}>
                    <span className={s.app}>Messages · Shop Line</span>
                    <span className={s.dim}>{t.at}</span>
                  </div>
                  <p>{t.body}</p>
                </li>
              ))}
            </ul>
          )}
          <div className={s.stats}>
            <div>
              <strong>{ownerTexts.length}</strong>
              <span className={s.dim}>booked by AI today</span>
            </div>
            <div>
              <strong>0</strong>
              <span className={s.dim}>calls missed</span>
            </div>
          </div>
        </section>
      </main>

      {booking && (
        <section className={s.cta}>
          <h2>That&apos;s what your customers would get.</h2>
          <p>
            Your shop&apos;s name, your hours, your open times, your number. Try
            it free for 14 days. No contract, and a real person picks up: me,
            Chad Lenseth, here in Albany.
          </p>
          <div className={s.ctaRow}>
            <a className={s.call} href={TRIAL_MAIL}>
              Start my free 14 days
            </a>
            <button type="button" className={s.ghostBtn} onClick={reset}>
              Try another call
            </button>
          </div>
        </section>
      )}

      {banner && (
        <button
          type="button"
          className={s.banner}
          onClick={() => setView("owner")}
          aria-live="assertive"
        >
          <span className={s.app}>Messages · to the owner</span>
          <span>{banner}</span>
        </button>
      )}

      <footer className={s.foot}>
        <p>
          Demo notes: {SHOP_NAME} is a made-up shop. Texts on this page are
          shown, not sent. Voice uses your browser&apos;s mic and speech . This
          page doesn&apos;t save what you say.
        </p>
        <p>
          Albany AI Guy ·{" "}
          <a href="mailto:hello@albanyaiguy.com">hello@albanyaiguy.com</a> ·
          Capital Region, NY
        </p>
      </footer>
    </div>
  );
}
