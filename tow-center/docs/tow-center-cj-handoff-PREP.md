# Tow.Center → CJ Towing — Twilio-free MVP handoff

**Date:** 2026-09-28  
**Verdict:** **READY to offer this week** (Twilio-free web + SMS compose MVP) — after Chad locks trial/pay terms flagged below and pastes CJ’s real cell into `?n=`.  
**Do not contact CJ** until Chad sends.  
**Do not provision Twilio.**  
**Do not invent** public demo URLs, Stripe links, EIN, free-trial length, or first-month dollar amounts.

## Live URL (verified)

- Production static MVP: `https://tow-center-mvp.vercel.app`  
  Verified 2026-09-28: HTTP 200 + page contains “Text the driver this job”.  
  Pin CJ’s cell with `?n=XXXXXXXXXX` after Chad has the number (digits only; write **518** as digits).
- Source (GitHub product path): `SoSo-Infinite/AlbanyAiGuy` → `tow-center/`  
  Local mirrors: `/workspace/AlbanyAiGuy/tow-center/` · `/workspace/albany-ai-guy/tow-center-mvp/`
- Tow voice persona (Lane C pack): `tow-center/personas/tow.md` · press-play: `/workspace/albany-ai-guy/press-play-hvac/` with `PERSONA_PACK=tow` + `BUSINESS_NAME='CJ Towing'`
- LiveKit press-play public URL: **unknown** (local only) — Lane K: never invent a live-call demo URL

---

## What the MVP does (step by step)

1. Chad (or CJ) opens the page once, enters **CJ’s cell**, taps **Save**, bookmarks the link that includes `?n=…`.
2. CJ shares that link (QR on truck, Facebook, Google Business, voicemail: “If I miss you, open this link and text me the job”).
3. Caller opens the link → enters **name, callback phone, pickup location, vehicle, need**.
4. Caller taps **Text the driver this job** → their phone’s Messages app opens an SMS **to CJ** with a structured TOW LEAD (free carrier SMS — no Twilio).
5. CJ gets a normal text from the caller. He **replies YES / NO**, calls them back, or uses the on-page reply buttons (same SMS thread). YES/NO also updates the on-device booked-job log (`localStorage`; Export JSON available).
6. Optional: labeled **Quick Sim** on the page shows how a voice desk would take the same lead. Local LiveKit press-play can use `PERSONA_PACK=tow` when Chad wants a spoken demo (keys on disk; **no public demo URL claimed**).

## What it cannot do without Twilio / paid telephony (honest)

- Answer CJ’s **real ring** automatically.
- Call-forward or catch missed PSTN calls into the agent.
- Send SMS from a **system / business number** while the caller does nothing (caller’s phone must send the text).
- Guaranteed inbound if the caller refuses to open a link or send SMS.

Workaround CJ can do free himself (optional, not built by us today): short voicemail greeting pointing to the link; or free Google Voice missed-call text — **Chad does not need to sign up for anything for the MVP to work.**

---

## Free trial + paywall TERMS (Chad locks required)

**Do not send dollar amounts or trial length to CJ until Chad fills the locks.**

| Term | Status |
| --- | --- |
| Free-trial length | **[CHAD LOCKS: free-trial length]** |
| First-month amount (after trial, to keep supported Tow.Center / voice path) | **[CHAD LOCKS: first-month amount]** |
| Full missed-call / inbound voice grand-slam (separate from SMS trial) | Lane C rate card already locked: **$1,000** setup + **$599/mo** — only cite if Chad wants that ladder in the same message |
| Setup deposit for fuller voice system | Rate-card / Lane H default context exists; **do not invent a deposit line in the CJ SMS-trial paste unless Chad confirms** |
| Payment automation | **None.** No Stripe. No new paid rails (Lane H). |
| Named manual rails Chad may use | Venmo **@InfiniteKid** · PayPal **cjames112@gmail.com** — options only; no bot automation |

---

## One-page handoff text (Chad → CJ)

*Paste after Chad fills the CHAD LOCKS brackets. Do not invent numbers.*

---

CJ —

Built you a simple Tow.Center trial that doesn’t need any new paid phone software.

**What it does**
- People who need a tow open your link and fill name, phone, where the car is, and the vehicle.
- Their phone texts **you** the job as a normal SMS.
- You reply YES, NO, or call them back on that same thread — even if you were under a truck or asleep when they first tried you.

**How to start the free trial (today)**
1. Open: https://tow-center-mvp.vercel.app
2. Enter your cell → Save → bookmark the link (it will look like `…?n=yournumber`).
3. Put that link in your voicemail / Facebook / a QR on the truck: “Missed me? Open this and text me the job.”
4. Have a friend send you one test job. Confirm the SMS hits your phone and reply YES once.

**What “a couple gigs booked” looks like**
- Two real people use the link and text you leads.
- You reply and roll (or schedule) at least two of those jobs.
- That’s proof the link is catching money you’d otherwise miss while you’re under a truck or sleeping.

**When the trial ends → first subscription month**
- Trial length: **[CHAD LOCKS: free-trial length]**
- First month to keep it as a supported Albany AI Guy system: **[CHAD LOCKS: first-month amount]**
- (Optional — only if Chad includes it:) Full answered-line / missed-call voice path later is the separate grand-slam on the rate card ($1,000 setup + $599/mo) — not required to use this free SMS link trial.
- Pay options Chad may use (manual): Venmo **@InfiniteKid** · PayPal **cjames112@gmail.com**
- No annual lock on the trial. Say the word and we stop.

Questions → Chad · Albany AI Guy · cjames112@gmail.com

---

## READY checklist

| Item | Status |
| --- | --- |
| Capture name / phone / location / vehicle | YES (web form) |
| Notify CJ by SMS | YES (caller `sms:` to CJ’s cell via `?n=`) |
| Accept / decline / reply | YES (native SMS thread + optional buttons) |
| Booked-job log | YES (localStorage + Export JSON; optional `docs/booked-jobs.md`) |
| Zero new paid services | YES |
| Zero Chad sign-in for MVP use | YES (static page) |
| Twilio | NOT used / NOT provisioned |
| Contact CJ | NOT done (prep only) |
| Free-trial length / first-month $ | **WAITING on Chad locks** |
| GitHub product path | `AlbanyAiGuy/tow-center/` |

**READY to offer this week** after Chad (1) locks trial length + first-month amount, (2) pastes CJ’s real cell into `?n=`, (3) sends the handoff himself.

## What Chad must do by hand

1. Fill **[CHAD LOCKS: free-trial length]** and **[CHAD LOCKS: first-month amount]** in this file before sending.
2. Get / confirm CJ’s cell → open live URL with `?n=` → Save → bookmark / QR.
3. Send the handoff to CJ (email/text) — bots must not contact CJ.
4. Optional: redeploy Vercel project `tow-center-mvp` from `tow-center/index.html` if the live site should match the latest HTML (Ask Before Acting on prod).
5. Optional: run local LiveKit press-play with tow persona for a spoken demo — do not claim a public live-call URL.
6. If CJ pays later: log deposits only in `/home/box/cfo/cash-log.md` (CFO or Chad); use named Venmo/PayPal manually — no new rails.
