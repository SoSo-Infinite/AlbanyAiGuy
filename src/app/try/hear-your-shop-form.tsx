"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  buildShopGreeting,
  SHOP_DETAIL_MAX,
  SHOP_NAME_MAX,
  SPEECH_DONE,
  SPEECH_SPEAKING,
  SPEECH_STOPPED,
  SPEECH_UNSUPPORTED,
} from "@/lib/hear-your-shop";

function canUseSpeech(): boolean {
  return (
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    typeof window.SpeechSynthesisUtterance === "function"
  );
}

function voiceLang(voice: SpeechSynthesisVoice): string {
  return voice.lang.replaceAll("_", "-").toLowerCase();
}

/** Prefer a local en-US voice, then any local English voice, then any English voice. */
function pickVoice(
  voices: SpeechSynthesisVoice[],
): SpeechSynthesisVoice | undefined {
  const usable = voices.filter((voice) => voice.lang);
  const localEnUs = usable.find(
    (voice) => voice.localService === true && voiceLang(voice) === "en-us",
  );
  if (localEnUs) return localEnUs;
  const localEnUsPrefix = usable.find(
    (voice) =>
      voice.localService === true && voiceLang(voice).startsWith("en-us"),
  );
  if (localEnUsPrefix) return localEnUsPrefix;
  const localEn = usable.find(
    (voice) => voice.localService === true && voiceLang(voice).startsWith("en"),
  );
  if (localEn) return localEn;
  return (
    usable.find((voice) => voiceLang(voice) === "en-us") ??
    usable.find((voice) => voiceLang(voice).startsWith("en-us")) ??
    usable.find((voice) => voiceLang(voice).startsWith("en"))
  );
}

export function HearYourShopForm() {
  const [shop, setShop] = useState("");
  const [service, setService] = useState("");
  const [hours, setHours] = useState("");
  const [status, setStatus] = useState("");
  const [speechSupport, setSpeechSupport] = useState<"unknown" | "yes" | "no">(
    "unknown",
  );
  const run = useRef(0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (!canUseSpeech()) {
      setSpeechSupport("no");
      return;
    }
    setSpeechSupport("yes");
    const synth = window.speechSynthesis;
    const prime = () => {
      synth.getVoices();
    };
    prime();
    synth.addEventListener("voiceschanged", prime);
    return () => {
      run.current += 1;
      synth.removeEventListener("voiceschanged", prime);
      synth.cancel();
    };
  }, []);

  const result = buildShopGreeting({ shop, service, hours });
  const showUnsupported = speechSupport === "no" && result.ok;
  const shopInvalid = !result.ok && shop.length > 0;
  const liveMessage = showUnsupported
    ? SPEECH_UNSUPPORTED
    : shopInvalid
      ? result.message
      : status;

  function speak(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = buildShopGreeting({ shop, service, hours });
    if (!next.ok) {
      if (canUseSpeech()) window.speechSynthesis.cancel();
      setStatus(next.message);
      return;
    }
    if (!canUseSpeech()) {
      setSpeechSupport("no");
      setStatus(SPEECH_UNSUPPORTED);
      return;
    }
    const synth = window.speechSynthesis;
    const id = ++run.current;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(next.script);
    utteranceRef.current = utterance;
    utterance.lang = "en-US";
    utterance.rate = 1;
    const voice = pickVoice(synth.getVoices());
    if (voice) utterance.voice = voice;
    utterance.onstart = () => {
      if (run.current !== id) return;
      setStatus(SPEECH_SPEAKING);
    };
    utterance.onend = () => {
      if (run.current !== id) return;
      setStatus(SPEECH_DONE);
    };
    utterance.onerror = (event) => {
      if (run.current !== id) return;
      if (event.error === "interrupted" || event.error === "canceled") {
        setStatus(SPEECH_STOPPED);
        return;
      }
      setStatus(SPEECH_UNSUPPORTED);
    };
    setStatus(SPEECH_SPEAKING);
    synth.resume();
    synth.speak(utterance);
  }

  function stop() {
    run.current += 1;
    if (canUseSpeech()) window.speechSynthesis.cancel();
    setStatus(SPEECH_STOPPED);
  }

  return (
    <form onSubmit={speak} className="grid gap-5">
      <div className="grid gap-2">
        <Label htmlFor="hear-shop-name">Shop name</Label>
        <Input
          id="hear-shop-name"
          value={shop}
          onChange={(event) => setShop(event.target.value)}
          maxLength={SHOP_NAME_MAX}
          required
          autoComplete="organization"
          autoCapitalize="words"
          placeholder="North Shop"
          aria-invalid={shopInvalid ? true : undefined}
          aria-describedby={shopInvalid ? "hear-shop-status" : undefined}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="hear-shop-service">Service, optional</Label>
        <Input
          id="hear-shop-service"
          value={service}
          onChange={(event) => setService(event.target.value)}
          maxLength={SHOP_DETAIL_MAX}
          autoComplete="off"
          placeholder="Haircuts"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="hear-shop-hours">Hours, optional</Label>
        <Input
          id="hear-shop-hours"
          value={hours}
          onChange={(event) => setHours(event.target.value)}
          maxLength={SHOP_DETAIL_MAX}
          autoComplete="off"
          placeholder="Tue to Sat, 9 to 6"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" className="min-h-11">
          Hear the greeting
        </Button>
        <Button
          type="button"
          variant="outline"
          className="min-h-11"
          onClick={stop}
        >
          Stop
        </Button>
      </div>
      <p
        id="hear-shop-status"
        className={
          shopInvalid
            ? "min-h-6 text-sm text-destructive"
            : "min-h-6 text-sm text-muted-foreground"
        }
        aria-live="polite"
        aria-atomic="true"
      >
        {liveMessage}
      </p>
      <div>
        <h3 className="text-sm font-semibold">Greeting</h3>
        <p
          id="hear-shop-script"
          className="mt-2 rounded-lg border border-border bg-background p-3 text-sm leading-relaxed"
        >
          {result.ok
            ? result.script
            : "The greeting shows up here after you enter a shop name."}
        </p>
      </div>
    </form>
  );
}
