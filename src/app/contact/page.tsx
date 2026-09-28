import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = {
  title: "Contact | Albany AI Guy",
  description:
    "Reach the Albany AI Guy desk — Capital Region lead capture, incubators, and bounty engines. hello@albanyaiguy.com",
  openGraph: {
    title: "Contact | Albany AI Guy",
    description: "Write the 518 desk at hello@albanyaiguy.com",
  },
};

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <div className="max-w-2xl">
        <p className="font-mono text-micro uppercase text-primary">Contact desk</p>
        <h1 className="mt-2 font-display text-headline">Talk to the Capital Region operator</h1>
        <p className="mt-3 text-muted-foreground">
          Service Shield, incubator, or scout desk — tell us what you need staged. Your client
          email opens a draft to{" "}
          <a
            href="mailto:hello@albanyaiguy.com"
            className="font-mono text-primary underline-offset-4 hover:underline"
          >
            hello@albanyaiguy.com
          </a>
          . No chatbot. One local desk.
        </p>
      </div>

      <div className="mt-10 max-w-2xl rounded-xl border border-border bg-card p-5 sm:p-8">
        <ContactForm />
      </div>
    </main>
  );
}
