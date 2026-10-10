# Albany AI Guy site: build-out 3 (Oct 10, 2026) — branch build-out-3-2026-10-10, local only, not pushed
Base: build-out-2-2026-10-09 815db59 (= live main).

## What changed
**New /tips page, "AI tips you can use today."** Six copy-and-paste prompts for any free assistant: prep any phone call in 30 seconds (the call-prep helper from the Facebook draft), missed-call text, voicemail greeting, reviews into FAQ answers, fine print in plain English (not-legal-advice + LASNNY pointer), monthly hours check. Each has Copy prompt (clipboard, spoken status) and Open in ChatGPT (prompt pre-typed; visitor taps send). Ends with a soft link to /shop-line and /work. ItemList JSON-LD; header nav "Tips", sitemap, llms.txt. Copy in src/lib/tips-content.ts (one array entry per tip). Doesn't touch /call or /trunk-line.

## Checks
biome clean · tsc clean · next build OK (/tips static) · axe 0 on /tips and / (mobile) · 0 console errors · no overflow at 390px · 0 third-party requests on /tips · copy → clipboard text matches; ChatGPT link round-trips the exact prompt · Lighthouse mobile /tips 97/100/100/100.
Evidence: /workspace/portfolio-push-2026-10-10/albanyaiguy/.

## Needs Chad
- "push it live" for /tips (fast-forward from live main).
- Optional: pin the call-prep tip link (albanyaiguy.com/tips#call-prep) in the Facebook post instead of the raw ChatGPT link, once it's live.
