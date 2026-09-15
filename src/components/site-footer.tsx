"use client";

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-10 sm:flex-row sm:items-end sm:justify-between sm:px-6">
        <div>
          <p className="font-display text-lg">Albany AI Guy</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Regional AI infrastructure for the Capital Region. 518 / 838 overlay only.
          </p>
        </div>
        <p className="font-mono text-xs text-faint">
          © 2026 AlbanyAIGuy.com · Operator of record · Not a chatbot wrapper
        </p>
      </div>
    </footer>
  );
}
