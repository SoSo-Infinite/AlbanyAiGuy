"use client";

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-10 sm:flex-row sm:items-end sm:justify-between sm:px-6">
        <div>
          <p className="font-display text-lg">Albany AI Guy</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Albany trunk-line concierge and AI voice receptionist for Capital
            Region businesses. Coming soon — join the pilot.
          </p>
        </div>
        <p className="font-mono text-xs text-muted-foreground">
          © 2026 Albany AI Guy · Chad Lenseth · Albany, NY ·{" "}
          <a
            href="mailto:hello@albanyaiguy.com"
            className="hover:text-foreground"
          >
            hello@albanyaiguy.com
          </a>
        </p>
      </div>
    </footer>
  );
}
