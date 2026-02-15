# Jouete Sales Dashboard – Project context for AI

## What this is

React dashboard for a jewelry store (Jouete): customer behavior, product/store/employee performance, segmentation, and time-based analysis. Data is **precomputed at build time** from CSV; the app loads JSON only.

## Commands

| Command | Purpose |
|--------|--------|
| `npm install` | Install dependencies |
| `npm run precompute` | Generate `public/data/precomputed.json` (uses `DATA_SOURCE`, default: mark) |
| `npm run precompute:jouete` | Precompute from Jouete CSVs in `public/data/` |
| `npm run precompute:mark` | Precompute from Mark CSVs in `src/data/` (same as default) |
| `npm run shrink:mark` | Shrink Mark CSVs to first N members (default 5000); filters sales and ranks by those IDs |
| `npm run test:mappers` | Test CSV mappers (common model, no Jouete in Mark output) |
| `npm run dev` | Start Vite dev server (default http://localhost:5173) |
| `npm run build` | Precompute (jouete) + TypeScript build + Vite build |
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
- `src/utils/` – `dataAnalysis.ts` (analysis logic), `precomputedDataLoader.ts` (loads JSON), `dataParser.ts` (CSV parsing), `csvMappers/` (Jouete/Mark → common model)
- `src/types.ts` – Common data model: `SalesRecord`, `MemberRecord`, `StoreCustomerRankRecord` (product-agnostic)
- `scripts/precomputeData.ts` – Build script; `DATA_SOURCE=jouete|mark` selects CSV source
- `public/data/` – Jouete: `sales_jouete_1y.csv`, `member_jouete.csv`; Mark: none (reads from `src/data/`); `precomputed.json` (generated)
- `src/data/` – Mark CSVs: `mark_membership.csv`, `mark_sales_202602131852.csv`, `mark_store_customer_ranks.csv`

## Conventions

- **Precomputed data**: All heavy analysis runs in `npm run precompute`; the UI only reads `precomputed.json`. Default data source is `mark`; set `DATA_SOURCE=jouete` for Jouete CSVs. After changing CSVs or analysis logic, run `npm run precompute` (or `npm run build`, which runs it via prebuild).
- **Common data model**: CSVs are mapped to `SalesRecord` and `MemberRecord` (and optionally `StoreCustomerRankRecord`) via `src/utils/csvMappers/`; analysis and UI consume only this model.
- **Sales only**: Count only rows where transaction type is 売上 (sale); exclude cancellations/refunds.
- **Currency/locale**: Yen (¥); number formatting uses `ja-JP` where relevant.
- **Default range**: Default date filter starts Q3 2024 (July 1, 2024).

## Quick onboarding (Mark – default)

1. `npm install`
2. Ensure `src/data/mark_membership.csv`, `mark_sales_202602131852.csv`, and `mark_store_customer_ranks.csv` exist
3. `npm run precompute` (or `npm run precompute:mark`; Mark membership is streamed for large files)
4. `npm run dev` → open http://localhost:5173

To use a smaller subset (e.g. first 5000 members) for faster local dev: run `npm run shrink:mark` (or `npx tsx scripts/shrinkMarkData.ts 5000`), then `npm run precompute`.

## Quick onboarding (Jouete)

1. `npm install`
2. Ensure `public/data/sales_jouete_1y.csv` and `public/data/member_jouete.csv` exist
3. `npm run precompute:jouete` (or `DATA_SOURCE=jouete npm run precompute`)
4. `npm run dev` → open http://localhost:5173 (redirects to `/ja` or `/en`)
