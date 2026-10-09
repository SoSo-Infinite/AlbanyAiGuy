import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/call", label: "The Albany AI Guy Line (coming soon)" },
  { href: "/shop-line", label: "AI front desk demo" },
  { href: "/contact", label: "Contact" },
];

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60dvh] max-w-6xl flex-col justify-center px-4 py-16 sm:px-6">
      <p className="font-mono text-micro uppercase text-primary">404</p>
      <h1 className="mt-2 font-display text-headline">
        That page isn&apos;t here
      </h1>
      <p className="mt-3 max-w-xl text-muted-foreground">
        The link may be old or mistyped. Try one of these instead:
      </p>
      <ul className="mt-6 flex flex-col gap-1">
        {LINKS.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="inline-flex min-h-11 items-center text-primary underline underline-offset-4"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
      <Button asChild className="mt-8 w-fit" variant="outline">
        <a href="mailto:hello@albanyaiguy.com">hello@albanyaiguy.com</a>
      </Button>
    </main>
  );
}
