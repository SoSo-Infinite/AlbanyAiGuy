# Albany AI Guy

Regional AI infrastructure for the Capital Region. Locked to **518 / 838**.

Site: [albanyaiguy.com](https://albanyaiguy.com)  
Repo: [SoSo-Infinite/AlbanyAiGuy](https://github.com/SoSo-Infinite/AlbanyAiGuy)

This is the production Next.js app for the desk:

- Territory gate (518/838 ZIP)
- Live ledger + Capital Region mesh
- Service Shield, Idea-to-Launch Incubator, 518 Bounty Engine
- Staging console (14-day window)
- Intelligence desk (`POST /api/briefing`, needs `XAI_API_KEY`)

The homepage is a working prototype. Persistence, payouts, SMS, and real operator accounts are tracked as GitHub issues.

## Local

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Try ZIP `12207` (Albany) or `12180` (Troy).

## Production env

| Variable | Where | Purpose |
| --- | --- | --- |
| `XAI_API_KEY` | Vercel (server) | Intelligence desk briefs |

## Roadmap

See [ROADMAP.md](./ROADMAP.md) and the open [issues](https://github.com/SoSo-Infinite/AlbanyAiGuy/issues).
