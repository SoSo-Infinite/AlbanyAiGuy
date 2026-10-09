"use client";

import { Mail } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const CONTACT_EMAIL = "hello@albanyaiguy.com";

export function ContactForm() {
  const [name, setName] = useState("");
  const [business, setBusiness] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const subject = `Albany AI Guy inquiry — ${business.trim() || name.trim()}`;
    const body = [
      `Name: ${name.trim()}`,
      `Business: ${business.trim()}`,
      `Phone: ${phone.trim()}`,
      `Email: ${email.trim()}`,
      "",
      "Message:",
      message.trim(),
    ].join("\n");

    const href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = href;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label
            htmlFor="contact-name"
            className="font-mono text-micro uppercase tracking-[0.12em]"
          >
            Name
          </Label>
          <Input
            id="contact-name"
            name="name"
            required
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
        </div>
        <div className="space-y-1.5">
          <Label
            htmlFor="contact-business"
            className="font-mono text-micro uppercase tracking-[0.12em]"
          >
            Business name
          </Label>
          <Input
            id="contact-business"
            name="business"
            required
            autoComplete="organization"
            value={business}
            onChange={(e) => setBusiness(e.target.value)}
            placeholder="Shop or company"
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label
            htmlFor="contact-phone"
            className="font-mono text-micro uppercase tracking-[0.12em]"
          >
            Phone
          </Label>
          <Input
            id="contact-phone"
            name="phone"
            type="tel"
            required
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="518…"
          />
        </div>
        <div className="space-y-1.5">
          <Label
            htmlFor="contact-email"
            className="font-mono text-micro uppercase tracking-[0.12em]"
          >
            Email
          </Label>
          <Input
            id="contact-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor="contact-message"
          className="font-mono text-micro uppercase tracking-[0.12em]"
        >
          Short message
        </Label>
        <Textarea
          id="contact-message"
          name="message"
          required
          maxLength={800}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="The trunk line, an AI receptionist for your shop, or joining the pilot?"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button type="submit" className="w-full sm:w-auto">
          <Mail />
          Open email to desk
        </Button>
        <p className="text-sm text-muted-foreground">
          Or write directly:{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="font-mono text-primary underline-offset-4 hover:underline"
          >
            {CONTACT_EMAIL}
          </a>
        </p>
      </div>

      <p className="font-mono text-micro uppercase tracking-[0.12em] text-faint">
        Note: inbox DNS for hello@albanyaiguy.com may still be propagating.
      </p>
    </form>
  );
}
