import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Albany AI Guy (Chad Lenseth) about the Albany trunk line, an AI voice receptionist for your shop, or joining the pilot. hello@albanyaiguy.com",
  alternates: { canonical: "/contact" },
  openGraph: {
    type: "website",
    siteName: "Albany AI Guy",
    url: "https://albanyaiguy.com/contact",
    title: "Contact | Albany AI Guy",
    description: "Write Chad at hello@albanyaiguy.com",
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "Albany AI Guy — coming soon, join the pilot",
      },
    ],
  },
};

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <div className="max-w-2xl">
        <p className="font-mono text-micro uppercase text-primary">
          Contact desk
        </p>
        <h1 className="mt-2 font-display text-headline">
          Contact Albany AI Guy
        </h1>
        <p className="mt-3 text-muted-foreground">
          Questions about the trunk line, an AI receptionist for your shop, or
          joining the pilot? This form opens a draft in your own email app,
          addressed to{" "}
          <a
            href="mailto:hello@albanyaiguy.com"
            className="font-mono text-primary underline-offset-4 hover:underline"
          >
            hello@albanyaiguy.com
          </a>
          . I read every message myself.
        </p>
      </div>

      <div className="mt-10 max-w-2xl rounded-xl border border-border bg-card p-5 sm:p-8">
        <ContactForm />
      </div>
    </main>
  );
}
