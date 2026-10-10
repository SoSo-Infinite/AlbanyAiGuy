"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { chatgptHref } from "@/lib/tips-content";

/** Copy a prompt, or open it in ChatGPT already typed in. Nothing is sent or stored by this site. */
export function CopyPrompt({
  prompt,
  title,
}: {
  prompt: string;
  title: string;
}) {
  const [status, setStatus] = useState("");
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
        <Button asChild variant="ghost">
          <a
            href={chatgptHref(prompt)}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open in ChatGPT
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
