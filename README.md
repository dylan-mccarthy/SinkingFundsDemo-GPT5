# Sinking Funds Manager

Track spending with rollover-based sinking funds. Built with SvelteKit, Skeleton UI, Prisma, and SQLite.

## Quick start

1. Install deps
2. Create the database (SQLite)
3. Run the dev server

### Commands

```bash
npm install
npx prisma migrate dev --name init # creates ./prisma/sinkingfunds.db
npm run dev
```

Then open <http://localhost:5173> and navigate to Funds.

## Tech stack

- SvelteKit + Skeleton (Tailwind)
- Prisma ORM + SQLite

## Notes

- API routes live under `src/routes/api`. UI pages under `src/routes`.
- `Transaction.tags` is stored as JSON due to SQLite limitations.
