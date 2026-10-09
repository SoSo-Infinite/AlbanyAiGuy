"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

const CONTACT_EMAIL = "hello@albanyaiguy.com";

function TopContactLine() {
  const pathname = usePathname();
  if (pathname !== "/") return null;

  return (
    <section
      aria-label="Contact"
      className="border-b-4 border-black bg-white text-black"
    >
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="block break-all text-[clamp(1.9rem,5.2vw,3.15rem)] font-semibold leading-none tracking-tight text-black underline decoration-[3px] underline-offset-[6px]"
        >
          {CONTACT_EMAIL}
        </a>
        <p className="mt-4 max-w-4xl text-[clamp(1.35rem,2.6vw,1.85rem)] font-medium leading-snug text-black">
          Contact me for help with veterans, people without a home, and anyone
          who needs a hand.
        </p>
      </div>
    </section>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  // The Shop Line demo is a full-screen, phone-first page with its own header.
  if (pathname?.startsWith("/shop-line")) return <>{children}</>;
  return (
    <>
      <TopContactLine />
      <SiteHeader />
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </>
  );
}
