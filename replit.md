# منصة مكافآت روبلوكس — Roblox Rewards Platform

## Overview

A full-stack Arabic RTL gaming rewards platform for kids/teens aged 8-18. Users earn points by inviting friends, can convert points to Robux, and withdraw their earnings.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Frontend**: React + Vite (RTL Arabic, Tajawal font)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server (port 8080, /api)
│   └── roblox-rewards/     # React frontend (port 19105, /)
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Pages

- `/` — Login/Register (toggle)
- `/dashboard` — Main dashboard with points, robux, progress bar, daily reward
- `/invite` — Invite friends, copy link, stats
- `/levels` — 10 levels with invite milestones
- `/rewards` — Redeem Robux rewards (400, 800, 1700)
- `/rare-items` — Locked/unlocked rare Roblox items
- `/leaderboard` — Top users by invites with weekly reset
- `/earnings` — Points to Robux conversion display
- `/withdraw` — 3-step withdrawal (Visa/Vodafone/Orange/Etisalat)
- `/unlock-rewards` — Locked rewards with progress
- `/profile` — User profile with badges

## API Routes (all under /api)

- `POST /api/auth/register` — Register with optional invite code
- `POST /api/auth/login` — Login
- `POST /api/auth/logout`
- `GET /api/users/me` — Current user
- `POST /api/users/daily-reward` — Claim 5,000 pts daily
- `GET /api/invites/generate` — Get invite link and stats
- `GET /api/rewards` — All rewards
- `POST /api/rewards/redeem` — Redeem a reward
- `GET /api/leaderboard` — Top users
- `GET /api/transactions` — User transactions
- `POST /api/withdrawals` — Create withdrawal
- `GET /api/withdrawals` — User withdrawal history

## Points Logic

- Registration bonus: 100,000 pts
- Each invite: 25,000 pts for referrer
- Daily reward: 5,000 pts
- Conversion: `points / 1000 * 500 = robux`

## Database Schema

Tables: users, invites, rewards, redemptions, transactions, withdrawals, badges, user_badges

## Design

- Language: Arabic (RTL, dir="rtl")
- Font: Tajawal (Google Fonts)
- Colors: Dark navy #1A1A2E, Roblox red #E8253D, Gold #FFD700
- Style: Bold, vibrant, gaming feel for kids
