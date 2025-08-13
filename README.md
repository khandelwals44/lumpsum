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

See `app/` for pages and layouts. Calculator logic lives in `lib/calc/*` as pure functions returning totals and time-series for charts and CSV.

### Add a Calculator

1. Create `lib/calc/yourcalc.ts` with a typed function returning totals and series.
2. Create `app/calculators/yourcalc/page.tsx` using `SliderWithInput`, `ResultStat`, and a Recharts graph in `ChartContainer`.
3. Add a card in `app/page.tsx`.

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
