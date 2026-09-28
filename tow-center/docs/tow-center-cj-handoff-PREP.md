# Tow.Center → CJ Towing — Twilio-free MVP handoff

**Date:** 2026-09-28  
**Verdict:** **READY to offer this week** (Twilio-free web + SMS compose MVP) — after Chad pastes CJ’s real cell into `?n=` and locks first-month amount if/when CJ opts in.  
**Do not contact CJ** until Chad sends.  
**Do not provision Twilio.**  
**Do not invent** public demo URLs, Stripe links, EIN, or first-month dollar amounts.

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

## Pay model (Chad’s locks)

**Use this tool free until you have made money from jobs that came through it.**  
CJ only starts paying when **he** is confident that revenue came from the tool’s help **and** he likes it — then he signs up for the subscription.

| Term | Status |
| --- | --- |
| Free period | Until CJ has made money from jobs attributed to the system **and** he is confident + likes it (no fixed calendar trial) |
| First-month subscription amount (when he opts in) | **[CHAD LOCKS: first-month amount]** — fill before quoting a number to CJ |
| Payment automation | **None.** No Stripe. No new paid rails (Lane H). |
| Named manual rails Chad may use | Venmo **@InfiniteKid** · PayPal **cjames112@gmail.com** — options only; no bot automation |
| Annual lock | **None.** Say the word and we stop. |

---

## One-page handoff text (Chad → CJ)

*Paste after Chad fills **[CHAD LOCKS: first-month amount]** if he wants a number in the message. Do not invent dollars.*

---

CJ —

Built you a simple Tow.Center setup that doesn’t need any new paid phone software.

**What it does**
- People who need a tow open your link and fill name, phone, where the car is, and the vehicle.
- Their phone texts **you** the job as a normal SMS.
- You reply YES, NO, or call them back on that same thread — even if you were under a truck or asleep when they first tried you.

**How to start today (free)**
1. Open: https://tow-center-mvp.vercel.app
2. Enter your cell → Save → bookmark the link (it will look like `…?n=yournumber`).
3. Put that link in your voicemail / Facebook / a QR on the truck: “Missed me? Open this and text me the job.”
4. Have a friend send you one test job. Confirm the SMS hits your phone and reply YES once.

**What “making money from it” looks like**
- Real people use the link and text you leads.
- You reply and roll (or schedule) those jobs.
- That’s proof the link is catching money you’d otherwise miss while you’re under a truck or sleeping.

**When you start paying**
- Use it **free until you’ve made money from jobs that came through this system**.
- You only start paying when **you’re confident** that revenue came from the tool’s help **and you like it** — then you sign up for the monthly subscription.
- First month when you opt in: **[CHAD LOCKS: first-month amount]**
- Pay options (manual): Venmo **@InfiniteKid** · PayPal **cjames112@gmail.com**
- No annual lock. Say the word and we stop.

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
| SSO / login | OFF (static page) |
| Legal entity | **Tow C Inc.** (not Tow.Center LLC) |
| Contact CJ | NOT done (prep only) |
| Pay model | Free until money from the tool + CJ confident/likes it → then subscribe |
| First-month $ | **WAITING on [CHAD LOCKS: first-month amount]** |
| GitHub product path | `AlbanyAiGuy/tow-center/` |

**READY to offer this week** after Chad (1) pastes CJ’s real cell into `?n=`, (2) fills first-month amount if he wants a number in the paste, (3) sends the handoff himself.

## What Chad must do by hand

1. Fill **[CHAD LOCKS: first-month amount]** before quoting a subscription number to CJ.
2. Get / confirm CJ’s cell → open live URL with `?n=` → Save → bookmark / QR.
3. Send the handoff to CJ (email/text) — bots must not contact CJ.
4. Optional: redeploy Vercel project `tow-center-mvp` from `tow-center/index.html` if the live site should match the latest HTML (Ask Before Acting on prod).
5. Optional: run local LiveKit press-play with tow persona for a spoken demo — do not claim a public live-call URL.
6. If CJ pays later: log deposits only in `/home/box/cfo/cash-log.md` (CFO or Chad); use named Venmo/PayPal manually — no new rails.
