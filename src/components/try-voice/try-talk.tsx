"use client";

import { useEffect, useRef, useState } from "react";
import { formatWholeDollars } from "@/lib/missed-calls";
import { demoById, TRY_DEMOS, type TryDemoId } from "@/lib/try-demos";
import {
  beginSession,
  bookingFromApi,
  createSession,
  LINE_CUT,
  MIC_BLOCKED,
  SILENCE_MS,
  SR_MISSING,
  STATUS_LISTENING,
  STATUS_TALKING,
  STATUS_THINKING,
  type StepResult,
  shopReplySession,
  silenceSession,
  visitorSession,
} from "@/lib/try-voice";

type Line = { id: number; role: "agent" | "visitor"; text: string };

type SR = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult:
    | ((event: {
        results: ArrayLike<
          ArrayLike<{ transcript: string }> & { isFinal: boolean }
        >;
      }) => void)
    | null;
  onend: (() => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

function getSR(): (new () => SR) | null {
  if (typeof window === "undefined") return null;
  const host = window as unknown as {
    SpeechRecognition?: new () => SR;
    webkitSpeechRecognition?: new () => SR;
  };
  return host.SpeechRecognition ?? host.webkitSpeechRecognition ?? null;
}

function pickVoice(): SpeechSynthesisVoice | undefined {
  if (typeof window === "undefined" || !window.speechSynthesis)
    return undefined;
  const voices = window.speechSynthesis
    .getVoices()
    .filter((voice) => voice.lang?.startsWith("en"));
  const prefs = [
    /Ava/i,
    /Samantha/i,
    /Aria.*Natural/i,
    /Jenny.*Natural/i,
    /Google US English/i,
    /Allison/i,
    /Zira/i,
  ];
  for (const pref of prefs) {
    const match =
      voices.find(
        (voice) => pref.test(voice.name) && voice.lang.startsWith("en-US"),
      ) ?? voices.find((voice) => pref.test(voice.name));
    if (match) return match;
  }
  return voices.find((voice) => voice.lang === "en-US") ?? voices[0];
}

function MicIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      aria-hidden="true"
      className="try-mic-icon"
    >
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        d="M12 3.5a3 3 0 0 1 3 3v5a3 3 0 0 1-6 0v-5a3 3 0 0 1 3-3z"
      />
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        d="M6.5 11.5a5.5 5.5 0 0 0 11 0M12 17v3.5M8.5 20.5h7"
      />
    </svg>
  );
}

export function TryTalk() {
  const [active, setActive] = useState<TryDemoId | null>(null);
  const opener = useRef<HTMLButtonElement | null>(null);

  return (
    <section className="try-talk" aria-label="Talk to a demo">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <ul className="try-talk-grid">
          {TRY_DEMOS.map((demo) => (
            <li key={demo.id}>
              <button
                type="button"
                className="try-talk-card"
                onClick={(event) => {
                  opener.current = event.currentTarget;
                  setActive(demo.id);
                }}
              >
                <span className="try-talk-title">{demo.jump}</span>
                <span className="try-talk-affordance">
                  <MicIcon />
                  Talk now
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      {active ? (
        <VoicePanel
          key={active}
          demo={active}
          onClose={() => {
            setActive(null);
            opener.current?.focus();
          }}
        />
      ) : null}
    </section>
  );
}

function VoicePanel({
  demo,
  onClose,
}: {
  demo: TryDemoId;
  onClose: () => void;
}) {
  const title = demoById(demo).jump;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const sendRef = useRef<(text: string) => void>(() => {});
  const [lines, setLines] = useState<Line[]>([]);
  const [interim, setInterim] = useState("");
  const [status, setStatus] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [result, setResult] = useState<StepResult | null>(null);
  const logRef = useRef<HTMLDivElement>(null);

  // Keep the newest line in view as the conversation grows.
  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll when lines or interim change
  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [lines, interim]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();
    titleRef.current?.focus();

    const alive = { current: true };
    const gen = { current: 0 };
    const sessionRef = { current: createSession(demo) };
    const wantListen = { current: false };
    const blocked = { current: false };
    const srRef: { current: SR | null } = { current: null };
    const silenceRef: { current: number | null } = { current: null };
    let lineId = 0;
    window.speechSynthesis?.getVoices();

    const append = (role: Line["role"], text: string) => {
      const id = ++lineId;
      setLines((current) => [...current, { id, role, text }]);
    };

    const clearSilence = () => {
      if (silenceRef.current != null) {
        window.clearTimeout(silenceRef.current);
        silenceRef.current = null;
      }
    };

    const abortSr = () => {
      const sr = srRef.current;
      srRef.current = null;
      try {
        sr?.abort();
      } catch {
        /* already stopped */
      }
    };

    const retryRef: { current: number | null } = { current: null };
    const clearRetry = () => {
      if (retryRef.current != null) {
        window.clearTimeout(retryRef.current);
        retryRef.current = null;
      }
    };

    const stopListen = () => {
      wantListen.current = false;
      clearRetry();
      abortSr();
      setInterim("");
    };

    const speakAll = (texts: string[], token: number) =>
      new Promise<void>((resolve) => {
        let index = 0;
        const next = () => {
          if (!alive.current || token !== gen.current) {
            resolve();
            return;
          }
          if (index >= texts.length) {
            resolve();
            return;
          }
          const text = texts[index];
          index += 1;
          if (!text) {
            next();
            return;
          }
          const synth = window.speechSynthesis;
          if (!synth) {
            next();
            return;
          }
          setStatus(STATUS_TALKING);
          const utterance = new SpeechSynthesisUtterance(text);
          const voice = pickVoice();
          if (voice) utterance.voice = voice;
          utterance.rate = 1.04;
          utterance.pitch = 1;
          let done = false;
          const finish = () => {
            if (done) return;
            done = true;
            window.clearTimeout(watchdog);
            next();
          };
          const watchdog = window.setTimeout(finish, 2500 + text.length * 120);
          utterance.onend = finish;
          utterance.onerror = finish;
          synth.speak(utterance);
        };
        next();
      });

    const startListen = () => {
      const Ctor = getSR();
      if (!Ctor) {
        blocked.current = true;
        wantListen.current = false;
        setNotice(SR_MISSING);
        setStatus("");
        return;
      }
      if (blocked.current || !alive.current) return;
      wantListen.current = true;
      abortSr();
      const sr = new Ctor();
      sr.lang = "en-US";
      sr.interimResults = true;
      sr.continuous = false;
      let finalText = "";
      sr.onresult = (event) => {
        let text = "";
        for (let i = 0; i < event.results.length; i++) {
          text += event.results[i]?.[0]?.transcript ?? "";
          if (event.results[i]?.isFinal) finalText = text;
        }
        setInterim(text);
        if (text.trim()) clearSilence();
      };
      sr.onerror = (event) => {
        if (
          event.error === "not-allowed" ||
          event.error === "service-not-allowed"
        ) {
          blocked.current = true;
          wantListen.current = false;
          setNotice(MIC_BLOCKED);
          setStatus("");
        }
      };
      sr.onend = () => {
        setInterim("");
        srRef.current = null;
        if (!alive.current || !wantListen.current || blocked.current) return;
        if (finalText.trim()) {
          const heard = finalText.trim();
          finalText = "";
          accept(heard);
          return;
        }
        retryRef.current = window.setTimeout(() => {
          retryRef.current = null;
          if (alive.current && wantListen.current && !blocked.current) {
            startListen();
          }
        }, 250);
      };
      srRef.current = sr;
      setStatus(STATUS_LISTENING);
      try {
        sr.start();
      } catch {
        blocked.current = true;
        wantListen.current = false;
        srRef.current = null;
        setNotice(SR_MISSING);
        setStatus("");
      }
    };

    const armSilence = () => {
      clearSilence();
      silenceRef.current = window.setTimeout(() => {
        if (!alive.current) return;
        stopListen();
        window.speechSynthesis?.cancel();
        void run(silenceSession(sessionRef.current));
      }, SILENCE_MS);
    };

    const postShop = async (step: StepResult, token: number) => {
      const request = step.shopRequest;
      if (!request) return;
      setStatus(STATUS_THINKING);
      let reply = LINE_CUT;
      let booking: ReturnType<typeof bookingFromApi> = null;
      try {
        const response = await fetch("/api/shop-line", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: request.messages,
            taken: request.taken,
          }),
        });
        const data = (await response.json()) as {
          reply?: unknown;
          booking?: unknown;
        };
        if (typeof data.reply === "string" && data.reply.trim())
          reply = data.reply;
        booking = bookingFromApi(data.booking);
      } catch {
        reply = LINE_CUT;
      }
      if (!alive.current || token !== gen.current) return;
      await run(shopReplySession(sessionRef.current, reply, booking));
    };

    const run = async (step: StepResult) => {
      const token = ++gen.current;
      window.speechSynthesis?.cancel();
      stopListen();
      clearSilence();
      sessionRef.current = step.state;
      setResult((current) => ({
        ...step,
        missed: step.missed ?? current?.missed ?? null,
        booking: step.booking ?? current?.booking ?? null,
        bookingSummary: step.bookingSummary ?? current?.bookingSummary ?? null,
      }));
      for (const text of step.say) append("agent", text);
      await speakAll(step.say, token);
      if (!alive.current || token !== gen.current) return;
      if (step.shopRequest) {
        await postShop(step, token);
        return;
      }
      if (step.armSilence) armSilence();
      if (step.listen) startListen();
      else setStatus("");
    };

    const accept = (text: string) => {
      const clean = text.trim();
      if (!clean) return;
      append("visitor", clean);
      void run(visitorSession(sessionRef.current, clean));
    };

    sendRef.current = accept;
    void run(beginSession(sessionRef.current));

    return () => {
      alive.current = false;
      gen.current += 1;
      wantListen.current = false;
      clearSilence();
      clearRetry();
      abortSr();
      window.speechSynthesis?.cancel();
      if (dialog.open) dialog.close();
    };
  }, [demo]);

  const statusClass =
    status === STATUS_LISTENING
      ? "is-listening"
      : status === STATUS_TALKING
        ? "is-talking"
        : status === STATUS_THINKING
          ? "is-thinking"
          : "";

  const missed = result?.missed?.ok ? result.missed : null;
  const summary = result?.bookingSummary ?? null;

  return (
    <dialog
      ref={dialogRef}
      className="try-dialog"
      aria-labelledby="try-voice-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onKeyDown={(event) => {
        if (event.key === "End") {
          event.preventDefault();
          onClose();
        }
      }}
    >
      <div className="try-dialog-body">
        <header className="try-dialog-head">
          <h2 id="try-voice-title" ref={titleRef} tabIndex={-1}>
            {title}
          </h2>
          <button type="button" className="try-end" onClick={onClose}>
            End
          </button>
        </header>
        <div className={`try-mic ${statusClass}`}>
          <span className="try-mic-ring" aria-hidden="true" />
          <MicIcon />
          <p className="try-status" aria-live="polite">
            {status}
          </p>
        </div>
        {notice ? <p className="try-notice">{notice}</p> : null}
        <div
          ref={logRef}
          className="try-log"
          role="log"
          aria-live="polite"
          aria-relevant="additions"
          aria-label="Conversation"
          // biome-ignore lint/a11y/noNoninteractiveTabindex: scrollable transcript must be keyboard-scrollable
          tabIndex={0}
        >
          {lines.map((line) => (
            <p
              key={line.id}
              className={line.role === "agent" ? "is-agent" : "is-visitor"}
            >
              <span className="try-who">
                {line.role === "agent" ? "Agent" : "You"}
              </span>
              {line.text}
            </p>
          ))}
          {interim ? (
            <p className="is-visitor is-interim">
              <span className="try-who">You</span>
              {interim}
            </p>
          ) : null}
        </div>
        {missed ? (
          <div className="try-result">
            <p className="try-result-figure">
              {formatWholeDollars(missed.monthlyDollars)} a month
            </p>
            <p>{formatWholeDollars(missed.yearlyDollars)} a year</p>
            <p>{missed.math}</p>
            <p>{missed.note}</p>
          </div>
        ) : null}
        {summary ? (
          <div className="try-result">
            <p>{summary}</p>
          </div>
        ) : null}
        <form
          className="try-compose"
          onSubmit={(event) => {
            event.preventDefault();
            const text = draft.trim();
            if (!text || status === STATUS_THINKING) return;
            setDraft("");
            sendRef.current(text);
          }}
        >
          <label className="try-compose-label" htmlFor="try-voice-input">
            Type your reply
          </label>
          <input
            id="try-voice-input"
            className="try-compose-input"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            maxLength={400}
          />
          <button
            type="submit"
            className="try-send"
            disabled={!draft.trim() || status === STATUS_THINKING}
          >
            Send
          </button>
        </form>
      </div>
    </dialog>
  );
}
