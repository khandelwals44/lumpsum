# lumpsum

lumpsum.in

## lumpsum.in – Mutual Fund Calculators (Next.js + TypeScript)

Modern, SEO-friendly calculator suite: EMI, SIP, Lumpsum, Goal Planner, FD, and NPS. 100% client-side. Accessible, fast, and ready for Vercel.

### Tech

- Next.js App Router, TypeScript
- Tailwind CSS, shadcn-style components, lucide-react
- Recharts (lazy loaded), next-themes
- ESLint (a11y), Prettier, Vitest + RTL
- CI on GitHub Actions

### Getting Started

```bash
npm i
npm run dev
```

App runs at `http://localhost:3000`.

### Scripts

- `dev`: start dev server
- `build`: production build
- `start`: start production server
- `lint`: run ESLint
- `typecheck`: run TypeScript checks
- `test`: run vitest
- `format`: run Prettier

### Deployment

Deploy on Vercel. The repo is Vercel-ready; import and deploy. Add a custom domain `lumpsum.in` in Vercel settings.

### Structure

See `app/` for pages and layouts. Calculator logic lives in `lib/calc/*` as pure functions returning totals and time-series for charts and CSV. UI and logic stay separated for readability and testing.

Key folders:

- `lib/calc/*`: pure TypeScript math (EMI, SIP, Lumpsum, Goal, FD, NPS, SWP, PPF, RD, IncomeTax)
- `app/calculators/*`: UI pages using the calc functions, URL state sync, charts, content/FAQ
- `components/*`: reusable UI (inputs, charts, share buttons)

### Add a Calculator

1. Create `lib/calc/yourcalc.ts` with a typed function returning totals and series (no UI, no formatting). Add concise comments at the top describing inputs/outputs.
2. Create `app/calculators/yourcalc/page.tsx` for UI. Keep state local, sync to URL via `useUrlState`, and reuse `SliderWithInput`, `ResultStat`, and `ChartContainer`.
3. Add a card in `app/page.tsx`.
4. Add tests in `tests/*` when adding new formulas.

### Features

- Calculators: EMI, SIP, Lumpsum, Goal Planner, FD, NPS, SWP, PPF, RD, Income Tax (simplified)
- Combined Invest (SIP/Lumpsum) page
- CSV export example (EMI)
- Share via Web Share API and social shortcuts (WhatsApp/Twitter/Email)
- Dark/Light theme, glassmorphism accents, lazy charts

### Formatting & Locale

Use helpers in `lib/format.ts` for en-IN currency and number formatting.

### URL Sharing

Inputs are synced to query params. Use the Share button to copy a full state URL.

### CSV Export

EMI amortization table includes an Export CSV button example. Use `toCsv` in `lib/format` for other series.

### Analytics

Add your analytics snippet inside the root layout where indicated (e.g., GA4). No keys are committed.

### Accessibility

Keyboard-friendly controls, focus rings, sufficient contrast, and semantic markup.

### Testing

Run `npm test`. Add unit tests alongside `tests/*`. Component tests can mount pages using RTL.

### CI

GitHub Actions runs install, typecheck, lint, tests, and build on PRs.

### PWA

Basic web manifest is present. Add a service worker if you want offline cache of calculator pages.

## Production Setup (Backend + Frontend)

- Frontend: Next.js app in this repo (see scripts). Env validated via `lib/env.ts`.
- Backend: Express service under `backend/` with Swagger UI at `/docs`. Env validated via `backend/src/env.ts`.

### Run locally

- Frontend

```
npm i
npm run dev
```

- Backend

```
cd backend
npm i
npm run dev
```

### Docker

- Build and run

```
docker-compose up --build
```

### Health

- Frontend: `GET /api/health`
- Backend: `GET /health`

### Swagger / API Docs

- Backend Swagger UI: `http://localhost:4000/docs`
- Raw OpenAPI: `docs/swagger.json`

### CI/CD

- GitHub Actions runs typecheck, tests, Prisma generate/db push/seed, and build.

### Tests

- Frontend: `npm test`
- Backend: `cd backend && npm test`

### Env

- Frontend: `.env.local` with `DATABASE_URL`, `NEXTAUTH_*`, optional `NEXT_PUBLIC_API_BASE_URL` to call backend.
- Backend: `.env` with `DATABASE_URL`, `JWT_SECRET`, `PORT`.
