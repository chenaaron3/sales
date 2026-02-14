# Jouete Sales Dashboard – Project context for AI

## What this is

React dashboard for a jewelry store (Jouete): customer behavior, product/store/employee performance, segmentation, and time-based analysis. Data is **precomputed at build time** from CSV; the app loads JSON only.

## Commands

| Command | Purpose |
|--------|--------|
| `npm install` | Install dependencies |
| `npm run precompute` | Generate `public/data/precomputed.json` from CSVs (run before first dev/build) |
| `npm run dev` | Start Vite dev server (default http://localhost:5173) |
| `npm run build` | Precompute + TypeScript build + Vite build |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build |
| `npm run deploy` | Build and deploy to gh-pages |

## Stack

- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS 4** + **Recharts** + **Radix UI** (tabs, tooltips, etc.)
- **i18next** for i18n (en/ja), **react-router-dom** (routes like `/ja`, `/en`)
- **PapaParse** + **tsx** for build-time CSV parsing and precompute script

## Important paths

- `src/` – App entry (`main.tsx`, `App.tsx`), components, utils, types, i18n
- `src/components/` – Dashboard, tab components (Customers, Product, Stores, Employees, Time), charts, filters
- `src/utils/` – `dataAnalysis.ts` (analysis logic), `precomputedDataLoader.ts` (loads JSON), `dataParser.ts` (build-time CSV)
- `scripts/precomputeData.ts` – Build script that reads CSVs and writes `precomputed.json`
- `public/data/` – `sales_jouete_1y.csv`, `member_jouete.csv`, `precomputed.json` (generated)

## Conventions

- **Precomputed data**: All heavy analysis runs in `npm run precompute`; the UI only reads `precomputed.json`. After changing CSVs or analysis logic, run `npm run precompute` (or `npm run build`, which runs it via prebuild).
- **Sales only**: Count only rows where transaction type is 売上 (sale); exclude cancellations/refunds.
- **Currency/locale**: Yen (¥); number formatting uses `ja-JP` where relevant.
- **Default range**: Default date filter starts Q3 2024 (July 1, 2024).

## Quick onboarding

1. `npm install`
2. Ensure `public/data/sales_jouete_1y.csv` and `public/data/member_jouete.csv` exist
3. `npm run precompute`
4. `npm run dev` → open http://localhost:5173 (redirects to `/ja` or `/en`)
