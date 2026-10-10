# Testing

Offline guard tests. They do not call `/api/briefing` or `/api/shop-line`, send mail, or submit the contact form.

## Run

```bash
nvm use
npm test
```

Node 22 or newer (`.nvmrc` is `22`, `engines.node` is `>=22`). `npm test` runs:

```bash
node --import ./tests/support/register.mjs --test tests/*.test.ts
```

Lint and the production build:

```bash
npm run lint
npm run build
```

## What each file guards

- `tests/call-line.test.ts` — While the line is coming soon, `/call`, `/trunk-line`, and `public/llms.txt` contain no `tel:` link. Emergency copy on `/call` and in `public/llms.txt` names 988 and 911.
- `tests/jsonld.test.ts` — Site and `/call` JSON-LD parse. `/call` includes `FAQPage`. The coming-soon graph has no `telephone`. The home FAQ JSON-LD matches the visible FAQ.
- `tests/robots-sitemap.test.ts` — Every crawler group disallows `/api/`, `/console`, and `/s/`. The sitemap lists the current public routes and no private ones.
- `tests/copy-honesty.test.ts` — Home and `/s/[code]` keep their wording and make no `$`, payout, or earnings promise. The referral page says the link does not earn or pay anything.
- `tests/shop-line-engine.test.ts` — Shop Line rule-engine replies, including bad input, and the fictional demo shop's slot helper.
- `tests/territory.test.ts` — Capital Region ZIP lookup, prefix fallback, and node ids.
- `tests/missed-calls.test.ts` — Missed-call estimate math, rounding, and rejected input.
- `tests/tips-content.test.ts` — Six tips, prompts with no phone or email, and ChatGPT links that encode the prompt.
- `tests/try-page.test.ts` — `/try` demos, the sitemap entry, and the header nav.
- `tests/hear-your-shop.test.ts` — Greeting script rejects blank, oversized, and unsafe shop names.
- `tests/shop-line-guard.test.ts` — The paid model stays off unless `SHOP_LINE_AI` is exactly `on`, with the daily and per-IP caps.
- `tests/sitemap.test.ts` — Sitemap includes `/tips` and `/tools/missed-calls`.

## Loader

Plain Node does not resolve `@/` or compile JSX. `tests/support/register.mjs` calls `register()` from `node:module` for `tests/support/loader.mjs`.

The `resolve` hook maps `@/x` to `<repo>/src/x`, and extensionless relative imports from files under `src/` and `tests/`, trying `.ts`, `.tsx`, `/index.ts`, and `/index.tsx`. Other specifiers go to Node's resolver. If that fails on an extensionless package subpath such as `next/link`, the hook retries once with `.js`, because Node's ESM loader does not add that extension.

The `load` hook transpiles `.ts` and `.tsx` files under the repo (not `node_modules`) with `typescript` (`module` ESNext, `target` ES2022, `jsx` react-jsx, `verbatimModuleSyntax` false) and returns `format: "module"`. `.css` imports are an empty default export. `.module.css` imports are a Proxy whose default export returns the class key.
