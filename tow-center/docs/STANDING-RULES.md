# Tow.Center — standing rules pointer

See OS canonical:

- `soso-infinite-systems-os/patterns/STANDING-RULES.md` — **518 digits** · **Ask Before Acting**
- Lane K — never invent demo/live-call URLs (`lanes/delivery-scope/rail-truth-checklist.md`)
- Lane H — no new paid rails without Chad ask; named Venmo `@InfiniteKid` / PayPal `cjames112@gmail.com` only as manual options
- Lane C — persona pack `tow`; full missed-call grand-slam pricing stays on rate card; **first-month amount = [CHAD LOCKS]** (see handoff). Pay model: free until money made + CJ confident + likes it.

Do not contact CJ. Do not provision Twilio for this MVP.

## Lane K rail-truth (verified 2026-09-28)

| Claim | Truth |
| --- | --- |
| Public MVP URL | `https://tow-center-mvp.vercel.app` (HTTP 200; “Text the driver this job”) |
| Notify driver | Caller `sms:` compose to CJ cell via `?n=` — **no Twilio** |
| Auth / SSO | **Off** — static page; zero login |
| Booked-job log | On-device `localStorage` + Export JSON (no paid DB) |
| LiveKit public demo URL | **Unknown / local only** — do not invent |
| Legal entity | **Tow C Inc.** (not “Tow.Center LLC”) |
| First-month $ | **[CHAD LOCKS]** — do not invent |

## Automated enforcement (issue #21)

- Module: `tow-center/lib/standing-rules.js` (browser + bun)
- Tests: `bun test tow-center/lib/standing-rules.test.js` (or `bun run test:tow-standing-rules`)
- Wired in `index.html`: driver NPA 518/838, pickup territory reject, Ask Before Acting on notify + clear-log, rail-truth status strip

**Chad leftovers (not issue blockers):** `[CHAD LOCKS]` first-month $ · CJ cell for `?n=` · Chad sends handoff (do not contact CJ) · optional Vercel redeploy of `tow-center-mvp` to ship `lib/` + confirm gate

