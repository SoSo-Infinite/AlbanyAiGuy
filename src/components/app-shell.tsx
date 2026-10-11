"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { MotionFallback } from "@/components/motion/motion-fallback";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  // The Shop Line demo is a full-screen, phone-first page with its own header.
  if (pathname?.startsWith("/shop-line")) return <>{children}</>;
  return (
    <>
      <MotionFallback />
      <SiteHeader />
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </>
  );
}
