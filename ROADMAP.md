# Build this out for real

Prototype is live in this repo. Tickets below are the production path.

## Launch (do first)

1. Connect the Vercel project to `main` so every push deploys. (#1)
2. Confirm [albanyaiguy.com](https://albanyaiguy.com) (and www) serves this build. (#3)
3. Set `XAI_API_KEY` on Vercel so the intelligence desk writes real briefs. (#6)
4. Wire operator intake: when a ZIP clears the gate, email/SMS the desk. (#7)

## Territory

- Replace prefix-list ZIP checks with a sourced 518/838 dataset (USPS / Census). (#8)
- Audit Greene / Columbia / North Country pockets.
- Label ledger stats as prototype until they are sourced. (#16)

## Engines

- **Service Shield** — real after-hours capture (Twilio + web form → operator inbox). (#9)
- **Incubator** — persist 30-day calendars per operator; export. (#10)
- **Bounty** — unique scout codes, referral table, Stripe Connect payouts. (#11)

## Platform

- Persist staging nodes (not `localStorage`). (#12)
- Operator accounts. (#13)
- Terms, privacy, territory policy. (#14)
- `hello@albanyaiguy.com` (or similar) for intake. (#15)
