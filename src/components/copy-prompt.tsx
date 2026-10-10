"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { chatgptHref } from "@/lib/tips-content";

/** Copy a prompt, or open it in ChatGPT already typed in. Nothing is sent or stored by this site. */
export function CopyPrompt({
  prompt,
  title,
  href,
  openLabel = "Open in ChatGPT",
  openClassName,
}: {
  prompt: string;
  title: string;
  /** Use this href instead of encoding `prompt` (the call-prep demo has a fixed URL). */
  href?: string;
  openLabel?: string;
  openClassName?: string;
}) {
  const [status, setStatus] = useState("");
  const openHref = href ?? chatgptHref(prompt);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setStatus("Copied. Paste it into any AI assistant.");
    } catch {
      setStatus("Couldn’t copy here. Select the text above and copy it.");
    }
  };
  return (
    <div className="mt-4">
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={copy}>
          Copy prompt<span className="sr-only">: {title}</span>
        </Button>
        <Button asChild variant="ghost" className={openClassName}>
          <a href={openHref} target="_blank" rel="noopener noreferrer">
            {openLabel}
            <span className="sr-only">
              {" "}
              with the prompt for {title} (opens in a new tab)
            </span>
          </a>
        </Button>
      </div>
      <output
        className="mt-2 block min-h-5 text-sm text-muted-foreground"
        aria-live="polite"
      >
        {status}
      </output>
    </div>
  );
}
