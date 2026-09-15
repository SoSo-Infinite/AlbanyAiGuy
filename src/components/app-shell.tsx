"use client";

import type { ReactNode } from "react";
import { Toaster } from "sonner";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <div className="flex-1">{children}</div>
      <SiteFooter />
      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{ className: "bg-card text-foreground border-border" }}
      />
    </>
  );
}
