# Packet Q18c — /try voice hero (2026-10-11)

Rebuilt the top of `/try` in the same Albany night as the home hero, and added four talk-now buttons. The sections under those buttons are unchanged: video, calculator, call-prep prompt, hear-your-shop form, and Contact. Metadata is unchanged. `/shop-line`, `/api`, and `src/lib/shop-line` were not edited.

## What was built
- `/try` hero reuses `HeroPoster` (Egg, agency towers, Corning Tower, Smith building, Capitol, moon, river) plus the whirlwind mascot cutout. Motion is CSS only. Desktop (`data-motion="desk"`, 768px and up) twinkles windows, dashes the roof arcs, pulses the moon, and runs river light streaks. Phones use opacity twinkle and the existing mascot float (transform and opacity). `prefers-reduced-motion: reduce` leaves the still poster and mascot image, with those animations forced off. No three.js and no `HeroLoader` on this route. The Q18b page band is not rendered on `/try`.
- Four glow pills, exact text: "Try it in 10 seconds", "4 demos", "No signup", "Nothing you say is saved". The h1, the Albany badge, and the sentence "Four demos. No sign-up, and nothing is stored." stay.
- Four large buttons, in `TRY_DEMOS` order, each with the demo title and a "Talk now" label plus an inline mic SVG. Pressing one opens a modal dialog, focuses the title, and starts the shared script.
- Voice tech: the browser Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition` and `speechSynthesis`), same voice list as the shop-line demo, copied into `src/components/try-voice/try-talk.tsx`. Helpers and the four flows live in `src/lib/try-voice/`. Nothing a visitor says or types is written to storage. The text field and Send button are always in the panel. If recognition is missing or the mic is blocked, the panel says so and keeps the text field. If speech synthesis is missing, the agent lines stay on screen and are not spoken.
- Shared script: "Let's make Albany easier." Then, after about 6 seconds with no final transcript, "No rush. Are you just browsing, or is there something specific on your mind?" A browsing reply (browsing, just looking, looking around, just browsing, not sure, nothing) gets the barber-booking example, then the demo's own questions. Any other reply goes straight into that demo.
- Shop line posts `{ messages, taken }` to `/api/shop-line` and speaks the reply. A returned booking is shown as a demo summary and is not described as a real appointment or a sent text. Missed calls asks for the three calculator inputs, parses spoken numbers, and uses `estimateMissedCalls` / `formatWholeDollars`. Call prep asks who and what, then builds a local script and exactly three questions, and links out with `CALL_PREP_URL` (new tab, `noopener`). Hear your shop asks for a name, an optional service, and optional hours, then speaks `buildShopGreeting`.
- Page band fix (all pages that use it): from 1280px wide the strip's box is at least as tall as the skyline drawing, so tower tops stay visible through 1920px. It stays CSS-only and `aria-hidden`. Phones keep the previous short height.

## Reviewer fixes
- Talk-now cards and the dialog title use the short demo labels (Shop line, Missed calls, Call prep, Hear your shop).
- /try hero overlays (moon glow, streaks, mascot) stay registered to the poster on desktop; on phones the skyline and mascot sit above the copy.
- Transcript auto-scrolls; a speech watchdog keeps the session moving if speechSynthesis never fires onend; interim speech cancels the silence prompt.

## Limits
- The hero mascot is the 360 webp cutout (`alt=""`, lazy, 160 by 192). The existing site-motion test rejects a 709 src on this page, so the hero does not use the 709 file.
- Shop-line replies are whatever `/api/shop-line` returns. The panel speaks that reply, then adds a demo summary that says it is not a real appointment and that no text is sent.
- Speech recognition needs a Chromium browser (or a stub). Firefox gets the type-in fallback. The silence prompt does not repeat.
- Desktop moon glow and river streaks start after hydration, when `data-motion` is set. Before that, and whenever motion is reduced, the poster is still.

# Packet Q18b — site-wide motion (2026-10-11)

Same visual language as the home hero, on the rest of the site. No copy, links, form fields, prices, or legal text changed. The home hero scene, its tests, and `/shop-line` are unchanged.

## What was built
- Shared reveal: `src/components/motion/reveal.tsx`. Sections and cards fade, rise, and (on a fine pointer) blur in with `animation-timeline: view()` where the browser supports it. Older browsers use one shared `IntersectionObserver` (`MotionFallback`) that never hides content in the server HTML. Card grids stagger.
- Route transition: `PageTransition` wraps page mains in React `<ViewTransition>` (crossfade plus a short rise). The header and footer keep fixed view-transition names so they stay still. If the installed React runtime has no `ViewTransition` export, the wrapper renders children unchanged. `prefers-reduced-motion: reduce` sets those animations to 0s.
- Micro-interactions: primary, secondary, outline, ghost, and destructive buttons get the hero glow, a slight lift, and a press scale, and only when motion is allowed. Focus rings stay. Cards with `motion-card` lift and pick up a border glow on hover or focus-visible. Nav and footer links draw an underline. In-page text links ease their underline offset. The emergency note and the privacy cards do not lift.
- Page band: `/try`, `/work`, `/tips`, `/tools/missed-calls`, `/contact`, `/call`, `/trunk-line`, `/privacy`, and the 404 page get a slim navy plaza strip. It reuses the poster landmark projection (towers, capitol roof, egg, one pulse arc, twinkling windows). CSS only. No WebGL.
- Footer: a skyline silhouette line sits above the footer text. A slow opacity sheen is the only motion.
- Mascot cutout (360 webp, `alt=""`, `loading="lazy"`, fixed box, `aria-hidden`): `/try` beside the demo list, `/contact` beside the form, `/tools/missed-calls` beside the calculator, `/work` and `/tips` and `/trunk-line` in the intro margin, 404 in a side column with a slow lost sway. He whirls in, floats, and the glow turns. A tap spins the whole image. Margin spots hide below 1280px. The demo-list spot hides below 640px. Every spot hides below 380px. Nothing on `/privacy`, `/call`, `/s/`, `/console`, or `/shop-line`.

## Per page
- `/` — reveals on the sections under the hero, route transition, button and card motion. Hero scene untouched.
- `/try`, `/work`, `/tips`, `/tools/missed-calls`, `/contact`, `/trunk-line` — band, reveals, mascot, route transition.
- `/call` — band, reveals, route transition. No mascot. Privacy cards do not lift. Emergency note does not lift.
- `/privacy` — band, reveals, route transition. No mascot and no card lift.
- 404 — band, reveal, lost pose, route transition.
- `/s/[code]` and `/console` — route transition only.
- `/shop-line` — not touched.

## Known limits
- Scroll-driven reveals need `animation-timeline: view()`. Other browsers get the single observer after hydration. Above-the-fold blocks that are already on screen do not replay a hide-and-show.
- Route transitions need a browser that implements the View Transitions API (the Next.js guide: Chromium 125+ and recent Safari and Firefox). Everyone else gets an instant swap.
- On a coarse pointer, reveals skip blur, the arc does not dash, and the whirlwind glow does not spin. Twinkle stays an opacity pulse.
- The mascot is the flat cutout only. The whole image moves. Eyes, face, and hands are not redrawn.
- Not built (future): rotating Albany scenes, and the site as a live animated ad.

# Packet Q15 — per-page X preview tags (2026-10-10)

Indexable pages now set `twitter` from the same title, description, and image as their Open Graph tags. `src/lib/social.ts` builds both objects, and the title and description strings are the ones each page already used. `/shop-line` keeps its file-convention share card: `twitter-image.png` is a byte copy of `opengraph-image.png`, so X no longer uses `/og.jpg` for that page. `/s/[code]`, `/console`, and the not-found page still inherit the layout card. No titles, descriptions, prices, or other copy changed.

# Packet Q14 — offline guard tests on Node 22 (2026-10-10)

`npm test` runs Node's test runner through `tests/support/register.mjs` and `tests/support/loader.mjs` (no `tsx`, no new dependencies). The loader maps `@/` to `src/`, transpiles repo `.ts` and `.tsx` with the TypeScript already installed, and stubs CSS. The ported guard tests cover the dark call line (no `tel:` links, 988 and 911), JSON-LD, robots and sitemap, home and `/s/` copy with no payout promise, the shop-line rule engine, and territory ZIPs. Sitemap expectations match the public routes that exist now, including `/try`, `/work`, `/tips`, and `/tools/missed-calls`. `.nvmrc` is `22` and `engines.node` is `22.x` (pins Vercel builds to Node 22 too). No app code or copy changes.

# Packet Q13 — shop-line AI cost guard (2026-10-10)

`/api/shop-line` calls the paid model only when `SHOP_LINE_AI` is exactly `on`, and then only up to `SHOP_LINE_AI_DAILY_MAX` AI calls per server instance per UTC day (default 200, clamped 0..2000). The per-IP limit remains, the IP map cannot grow without bound, non-JSON and oversized POSTs are rejected, and cross-origin POSTs never reach the paid model (they get the rule engine). Over the cap, visitors still get the rule engine (status 200). With no env vars set, live behavior is identical to today: the rule engine answers.

# Packet Q4 — missed-call cost calculator (2026-10-10)

Local only. Nothing from this pass was deployed, pushed, or committed.

## What changed
- New page `/tools/missed-calls`: missed calls per week, percent that would have booked, and average job value. Defaults are 10, 30%, and $150. A month is 52/12 weeks and a year is 52 weeks. Monthly and yearly figures round half up to whole dollars. Blank, negative, non-numeric, and huge inputs are rejected. The result says "This is an estimate from your own numbers." The page does not list prices, packages, or offers, and it ends with the header nav's Contact link (`/contact`).
- The form has visible labels, `inputmode="numeric"`, a polite live region, and 44px targets. The default estimate is in the server-rendered HTML, so it shows with JavaScript off. With JavaScript, the result updates as you type. Without JavaScript, Calculate submits the form with GET and the page renders that estimate.
- The math is in `src/lib/missed-calls.ts`.
- `/tips` ends with a link to the calculator. The header nav items are unchanged; the Contact label is shared from `src/lib/nav.ts`.
- `src/app/sitemap.ts` includes `/tools/missed-calls` (`/tips` was already listed). `public/llms.txt` lists the calculator.
- `npm test` runs `node --test --experimental-strip-types` (Node's built-in runner). No new dependencies. `tsconfig.json` sets `allowImportingTsExtensions` so those `.ts` test imports typecheck.

## Not in this pass
Pricing, offers, the trunk line, the phone line, the senior check-in, contact details, and deploys.

# SEO + AI-visibility pass — branch `seo-ai-visibility-2026-10-08`

Prepared Oct 8, 2026 (ET). **Local only.** Nothing has been pushed or deployed, and no Vercel, DNS or GitHub settings were changed.

## Which folder is the live source
- **`/workspace/AlbanyAiGuy`** (remote `SoSo-Infinite/AlbanyAiGuy`, branch `main` @ `66b1295`) is the live site.
  - Vercel's GitHub bot created the **Production** deployment for `66b1295` on Oct 8, 2026 at 7:58 AM ET.
  - Live `/` and `/shop-line` match that commit (same title, routes and copy).
  - Local `main` was already level with `origin/main` after a read-only `git fetch`, so nothing needed pulling.
- **This branch is a git worktree** of that repo at `/workspace/albanyaiguy-site-fix`, branched from `main` @ `66b1295`. `/workspace/AlbanyAiGuy` itself was not switched or modified.
- **Other candidates are not the live source:**
  - `/workspace/albanyaiguy`: notes only, not a git repo.
  - `/workspace/albany-aiguy`: one brief file.
  - `/workspace/albany-aiguy-portal`: a separate Vite/three.js "Intensity Portal" experiment, not a git repo.
- **Vercel project** (read from the commit status link only): `albanyaiguy`, team `cjames112-8296s-projects`. Pushing to `main` triggers a Production deploy.

## Every change
| File | Change |
|---|---|
| `src/app/robots.ts` (new) | `/robots.txt`. Allows `*` but disallows `/api/`, `/console` and `/s/`. Explicitly allows Googlebot, Bingbot, OAI-SearchBot, ChatGPT-User, Claude-SearchBot, Claude-User, PerplexityBot, Perplexity-User, Applebot and DuckDuckBot, plus the training crawlers GPTBot, ClaudeBot, Google-Extended and Applebot-Extended. Points to the sitemap. |
| `src/app/sitemap.ts` (new) | `/sitemap.xml` with `/`, `/trunk-line`, `/shop-line` and `/contact`. |
| `public/llms.txt` (new) | Adapted from `trunk-line/site-drafts/llms.txt`. The placeholder phone number, the "24/7" hours and links to category pages that don't exist yet were removed. Adds an explicit "coming soon" status, the real live pages, and a "Planned (not live yet)" list. |
| `src/lib/jsonld.ts` (new) + `src/app/layout.tsx` | Site-wide JSON-LD (`Organization` / `ProfessionalService` / `LocalBusiness` + `WebSite`), adapted from `site-drafts/jsonld/home.json`. Has no telephone (no number yet), no 24/7 hours, no ratings or reviews, and no placeholder `sameAs` URLs. `sameAs` contains only Chad's LinkedIn URL as found in his own files. `<` is escaped per the Next.js docs. |
| `src/lib/home-content.ts` (new) | Homepage FAQ. The visible FAQ and the `FAQPage` JSON-LD are generated from the same list, so the markup always matches the text. |
| `src/app/layout.tsx` | New default title and description, a title template (`%s \| Albany AI Guy`), OpenGraph and Twitter cards using `/og.jpg` (1200×630), author/creator set to Chad Lenseth, and `robots: index, follow`. |
| Canonical tags | Set per page so they can't leak from the layout: `/` → `https://albanyaiguy.com`, plus `/trunk-line`, `/shop-line` and `/contact`. `metadataBase` is `https://albanyaiguy.com`. |
| `public/og.jpg` (new) + `scripts/make-og.py` (new) | Code-generated branded card: navy background with the ALBANY / AI / GUY wordmark, "One local number for Albany. An AI front desk for local shops.", a "Coming soon · Join the pilot" pill and albanyaiguy.com. No photo. Regenerate with `python3 scripts/make-og.py`. |
| `public/logo.png` (new) | Copy of `albany-ai-guy/brand/avatar-400.png` (the genie mascot), so the JSON-LD `logo` URL resolves. |
| `src/app/page.tsx` | **Homepage rewritten** as a server-rendered page, so crawlers get full text without JavaScript. See the before/after below. |
| `src/app/trunk-line/page.tsx` (new) | `/trunk-line` landing page: how it will work (4 steps), ground rules, where it starts, and a join-the-pilot section. Clearly marked "coming soon". |
| `src/components/site-header.tsx` | Nav changed from Deploy / Ledger / Engines / Territory / Doctrine to **Trunk line / AI receptionist / Demo / FAQ / Contact**. The "Verify ZIP" button is now **"Join the pilot"**. |
| `src/components/site-footer.tsx` | New positioning line plus "© 2026 Albany AI Guy · Chad Lenseth · Albany, NY · hello@albanyaiguy.com". |
| `src/app/contact/page.tsx` | Removed "bounty engines / Service Shield / incubator / scout desk". New title, description, canonical and OG. |
| `src/app/shop-line/page.tsx` | Added canonical `/shop-line`. The title is kept as-is (absolute). The demo itself is untouched. |
| `src/app/console/layout.tsx` (new), `src/app/s/[code]/page.tsx` | `noindex, nofollow` on the app-only `/console` and on referral `/s/*` pages. They are also disallowed in robots.txt. |
| `next.config.ts` | **Duplicate-host fix in code:** a permanent (308) redirect from host `albanyaiguy.vercel.app` → `https://albanyaiguy.com/:path*`. Only that exact host is matched, so preview URLs keep working. Tested locally: the vercel.app host returns 308 to `.com`; `.com`, preview-style hosts and localhost return 200. |

**Not changed:**
- `/shop-line` and its API.
- The old homepage components (`hero-gate`, `ticker`, `live-ledger`, `engines`, `territory-grid`, `doctrine`, `briefing-panel`) and `src/lib/*`. They are no longer rendered on `/`, but still exist (see decisions).
- The top contact strip on `/` ("Contact me for help with veterans…").

## Homepage copy: before → after
**Before (live today):**
- Title: "Albany AI Guy | 518 Regional AI Infrastructure"
- Meta: "Turnkey lead capture, incubators, and bounty engines for the Capital Region. Locked to 518/838."
- H1: "AI infrastructure, locked to the 518."
- Lead: "Turnkey lead capture, after-hours response, and channel engines for Capital Region operators, creators, and scouts. Fourteen days to a running system. No outside-area access."
- Sections: ZIP "territory gate" with tracks "Local Service Shield / Idea-to-Launch Incubator / **518 Bounty Engine**" · "The 518 live ledger" with **made-up stats** (45,280+ businesses mapped, 142 active local AI systems, 389 incubator starts, 215 active bounty scouts) and a fake rolling ops log · "Engineered for instant deployment" · "The overlay, municipality by municipality" · "The Capital Region does not need another chatbot" (FAQ incl. "How do scouts get paid?" with $ bounty amounts) · "Commission a 14-day brief".

**After (this branch):**
- Title: "Albany AI Guy | Albany trunk line & AI voice receptionist for local businesses"
- Meta: "One local number for Albany, NY, and an AI phone receptionist that answers and books for Capital Region shops — barbers, salons, HVAC, plumbers. Coming soon — join the pilot."
- Badge: "Albany, NY · 518 · Coming soon"
- H1: "Albany's trunk-line concierge and AI voice receptionist for local businesses"
- Lead: "I'm Chad Lenseth, the Albany AI Guy. I'm building two things for the Capital Region: one local number you can call to find and book a trusted shop, and an AI receptionist that answers a shop's phone when the owner can't. Neither is live yet — I'm looking for a small group of Albany-area shops to pilot it with me." Buttons: **Join the pilot** (mailto) · **Try the barbershop demo** (/shop-line).
- H2 "The Albany trunk line": call one number, say what you need, and it finds a qualifying shop and books it or requests a callback. Bookings go only to opted-in partners. Status: coming soon.
- H2 "An AI voice receptionist for your shop phone": answers when you're mid-cut, under a sink or closed, books the appointment or takes a callback, sends you a summary, and can hand off to a real person. Built for barbershops, hair & nail salons, HVAC, plumbers, electricians and auto repair. Links to the demo.
- H2 "Where things stand":
  - Live now: the /shop-line web demo (fictional barbershop), the site and email.
  - Coming soon: the trunk-line number, the receptionist on real shop phones, and the partner directory.
  - "You won't see customer counts or testimonials here yet, because there aren't any."
- H2 "Chad Lenseth, Albany AI Guy": short bio and LinkedIn link.
- H2 "FAQ": 6 Qs (is it live, what the receptionist does, what the trunk line is, areas, how to join, emergencies → 911).
- H2 "Run a 518 shop? Pilot it with me.": email hello@albanyaiguy.com. **No pricing, no payment handles, no fake customers or stats.**

## Build and verification (local, `bun run build` + `next start -p 3917`)
- The build passes (Next 16.3.5, Turbopack). Routes: `/`, `/trunk-line`, `/shop-line`, `/contact`, `/robots.txt`, `/sitemap.xml`, `/console`, `/s/[code]`.
- **HTTP 200:** `/`, `/trunk-line`, `/shop-line`, `/contact`, `/robots.txt` (text/plain), `/sitemap.xml` (application/xml), `/llms.txt`, `/og.jpg` (image/jpeg) and `/logo.png`.
- **Rendered `<head>` checks:**
  - Canonical: `/` → `https://albanyaiguy.com`; `/trunk-line`, `/shop-line` and `/contact` → their own `.com` URLs.
  - OG: og:url and og:image are correct per page; Twitter card is `summary_large_image`.
  - JSON-LD: parses on every page. The `/` page also has `FAQPage`.
  - Robots: `/console` and `/s/*` are `noindex, nofollow`.
  - Text: zero "bounty" and zero "vercel.app" strings on any rendered page.
- **Biome:** touched files are clean. Untouched files still have pre-existing format warnings (`api/briefing`, `console/page.tsx`, `globals.css`).
- **Screenshots** (headless Chrome): `/workspace/albanyaiguy-site-fix-screens/` → `home-desktop.png`, `home-mobile.png`, `trunk-line-desktop.png`, `contact-desktop.png`.

## What Chad approves: the single push
The branch is one commit on top of `main` @ `66b1295`, so this is a fast-forward:

```bash
git -C /workspace/albanyaiguy-site-fix push origin seo-ai-visibility-2026-10-08:main
```
That updates `main`, and Vercel auto-deploys it to Production on albanyaiguy.com.

*(Preview-first alternative: `git -C /workspace/albanyaiguy-site-fix push -u origin seo-ai-visibility-2026-10-08` gives a Vercel preview URL to check. Then run the command above.)*

## Vercel domain fix (describe only; not done)
- The code redirect above already sends `albanyaiguy.vercel.app` → `albanyaiguy.com` once deployed.
- Belt and braces in the dashboard:
  1. Open Vercel → project **albanyaiguy** → **Settings → Domains**.
  2. Make sure `albanyaiguy.com` is attached to **Production**. If `www.albanyaiguy.com` is listed, set it to **redirect to `albanyaiguy.com`** (308).
  3. On the `albanyaiguy.vercel.app` row, choose **Edit → Redirect to `albanyaiguy.com`** (permanent).
- After deploy, Chad should do these himself:
  - **Google Search Console:** add `albanyaiguy.com` (Domain property via DNS TXT, or URL-prefix via HTML tag), submit `https://albanyaiguy.com/sitemap.xml`, and request indexing for `/`.
  - **Bing Webmaster Tools:** import from GSC, or add the site and submit the sitemap.
- **Optional (GitHub setting, not done):** the repo's "Website" field still says `https://albanyaiguy.vercel.app`. Change it to `https://albanyaiguy.com`.

## Decisions for Chad
1. **`/shop-line`:** kept as-is. It's the one live demo and is now linked from the nav and homepage. Expanding it to 600+ words with an FAQ (from the visibility research) is a later step.
2. **Spec-loom pages:** **not in this repo** and not on albanyaiguy.com (`/spec-loom` returns 404). They live on separate Vercel projects (`albany-spec-loom-*.vercel.app`) that use real businesses' names and numbers without opt-in, per `trunk-line/BUILD-PLAN.md`. Keep or take down? That's your call, and it's outside this push.
3. **Old homepage components:**
   - The bounty/ledger/territory components are no longer rendered but still exist, and `/s/[code]` and `/console` still use them (now noindexed).
   - Delete them in a follow-up, or keep them?
   - Note: `src/lib/ledger.ts` holds the made-up stats.
4. **Top contact strip on `/`** ("Contact me for help with veterans, people without a home…"): kept unchanged because you added it on Oct 3. Keep it, move it to the footer, or drop it?
5. **Training crawlers** (GPTBot, ClaudeBot, Google-Extended, Applebot-Extended) are **allowed** for maximum exposure. Flip them to `disallow` in `src/app/robots.ts` to opt out of training while staying in AI search.
6. **LinkedIn URL** in the JSON-LD and on the page is `linkedin.com/in/chad-lenseth-26b55938`, taken from your workspace files. Confirm it's yours. Add your Google Business Profile, LinkedIn company page and X URLs to `sameAs` once they're confirmed (I didn't guess them).
7. **Unknown fork `samsiroo/AlbanyAiGuy`** (read-only check):
   - It's a **GitHub fork of your public repo**, created Sep 15, 2026 at 1:02 AM ET, with **no commits of its own**. Its latest commit is your `3959aab`, and its "Website" field copies your vercel.app URL.
   - The account `samsiroo` (created 2017, no name/bio/location) has 5 public repos, all forks made Sep 15–16, 2026 (pgstrap, sst-eks-surrealdb, twenty, UNIT3D).
   - It's not a collaborator on your repo; the only collaborator is SoSo-Infinite. **Owner identity unknown.** It looks like a bulk-forking account.
   - It outranks you on Brave for "Albany AI Guy". Your new canonical tags and the .com redirect should help. Options: ignore it, or make your repo private (that detaches forks). Your call.
