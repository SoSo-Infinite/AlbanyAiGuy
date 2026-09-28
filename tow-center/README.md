# Tow.Center MVP (Twilio-free)

Static intake for solo tow drivers — **CJ Towing** warm lead (Albany AI Guy / Lane C persona pack).

**Repo path:** `tow-center/` in [SoSo-Infinite/AlbanyAiGuy](https://github.com/SoSo-Infinite/AlbanyAiGuy)  
**Local mirror:** `/workspace/albany-ai-guy/tow-center-mvp/`  
**Voice persona:** `personas/tow.md` · press-play stack: `/workspace/albany-ai-guy/press-play-hvac/` with `PERSONA_PACK=tow` + `BUSINESS_NAME='CJ Towing'`

## Verified public URL (static MVP)

- `https://tow-center-mvp.vercel.app` — verified 2026-09-28 (HTTP 200 + “Text the driver this job”)
- Pin CJ’s cell: `?n=` + digits only (example shape: `?n=5185551234` — never invent CJ’s real number)
- Next.js static mirror (same HTML): `/tow-center/` on the AlbanyAiGuy deploy when that path is live; do **not** invent a second public demo URL until verified (Lane K)

LiveKit press-play remains **local / unknown public URL** until rail-truth says otherwise.

### Rail-truth (Lane K)

| Item | Status |
| --- | --- |
| Notify path | `sms:` compose — **no Twilio** |
| SSO / login | **Off** (static page) |
| Entity | **Tow C Inc.** — not “Tow.Center LLC” |
| First-month $ | **[CHAD LOCKS]** — do not invent |

## What it does

1. Caller enters **name, phone, pickup location, vehicle, need**.
2. Phone opens `sms:` to the driver’s cell with a structured lead (caller’s carrier SMS — free).
3. Driver accepts/declines by replying on that thread (or YES/NO reply buttons).
4. Minimal **booked-job log** on-device (`localStorage`) + Export JSON; optional append into `docs/booked-jobs.md` (no paid DB).
5. Labeled **Quick Sim** walks the voice-desk script (no PSTN).

## What it does NOT do (without Twilio / paid telephony)

- Answer the driver’s real phone number automatically
- Call-forward / missed-call capture from the PSTN
- System-originated SMS from a short code or business number

**Do not provision Twilio for this MVP.** Paid telephony only after payment (Lane C / Lane G).

## Standing rules (OS aligned)

Canonical: `/workspace/soso-infinite-systems-os/patterns/STANDING-RULES.md`

| Rule | Apply here |
| --- | --- |
| **518 as digits** | Always write `518` — never spell it out |
| **Ask Before Acting** | Do not contact CJ; Chad sends handoff. Do not invent pricing/trial length for the free SMS trial |
| **Lane K rail-truth** | Never invent public demo / live-call claims. Quick Sim ≠ live PSTN. Cite only verified URLs |
| **Lane H cash** | No new paid rails without Chad ask. Named options only: Venmo `@InfiniteKid`, PayPal `cjames112@gmail.com` (manual — no automation) |


## Standing-rules tests (issue #21)

```bash
bun test tow-center/lib/standing-rules.test.js
```

Enforced in `lib/standing-rules.js` + wired in `index.html`:

- Driver cell entry: **518** / **838** NPA only (out-of-turf rejected)
- Pickup: clear out-of-Capital-Region places rejected
- Notify / clear-log: **Ask Before Acting** confirmation gate
- Lane K rail-truth: verified vs staged vs unknown — no invented LiveKit URL or first-month $


## Driver link

Share `https://tow-center-mvp.vercel.app/?n=<CJ_CELL_DIGITS>`. Also saved in `localStorage` after “Save on this device.”

## LiveKit (optional local)

```bash
cd /workspace/albany-ai-guy/press-play-hvac
# .env: PERSONA_PACK=tow  BUSINESS_NAME="CJ Towing"
source .venv/bin/activate
python agent.py dev   # terminal 1
python token_server.py  # terminal 2 → http://127.0.0.1:8080
```

No public LiveKit demo URL claimed.

## Deploy

Static files — existing Vercel project `tow-center-mvp`, or copy `index.html` from this folder. No env vars required for the static page.

Redeploy from this repo’s `tow-center/index.html` (or `public/tow-center/index.html`) when Chad wants the live Vercel project updated — **Ask Before Acting** on production deploys that change CJ-facing copy.

## Handoff

Prep only (do **not** send to CJ):  
`/home/box/cfo/tow-center-cj-handoff-PREP.md` · mirror `offers/tow-center-cj-handoff-PREP.md` under albany-ai-guy workspace.
