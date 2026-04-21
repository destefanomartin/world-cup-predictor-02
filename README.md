# Pitch Picks — World Cup 2026 Predictions

Private-league prediction game for the FIFA World Cup 2026.
**React + Vite + Tailwind**, **Supabase** (auth, Postgres, RLS, edge functions),
**football-data.org** for live fixtures, deployed on **Vercel**.

## 1. Local setup

```bash
npm install
cp .env.example .env.local        # fill in VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
npm run dev
```

`/` is protected — you'll be redirected to `/auth` to sign up. After signup, go to
`/leagues` to create a league or join one with an invite code (6 uppercase chars).

## 2. Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. Apply the schema:
   - **CLI**: `supabase link --project-ref <ref> && supabase db push` (uses `db/migrations/`)
   - **Or**: paste `db/setup.sql` into the SQL editor.
3. Auth → URL Configuration: set Site URL to your Vercel URL and add `http://localhost:5173` to Redirect URLs.
4. Copy `Project URL` and `anon public` key into `.env.local` and into Vercel env vars.
5. (Optional) Regenerate types after schema is live:
   `supabase gen types typescript --project-id <ref> > src/lib/database.types.ts`

### Edge functions

```bash
mkdir -p supabase/functions
cp -r db/functions/* supabase/functions/
supabase secrets set FOOTBALL_DATA_TOKEN=<your-token>
supabase functions deploy sync-matches --no-verify-jwt
supabase functions deploy score-bonus
```

Schedule `sync-matches` to run a few times a day (Supabase Cron, or a GitHub Action
hitting the function URL). It upserts fixtures from football-data.org's `WC`
competition and calls the `score_match` SQL function for every finished match.
The leaderboard view updates automatically.

## 3. Sports API

- Provider: **football-data.org** (free tier covers WC).
- Register at <https://www.football-data.org/client/register>, paste the token into
  the `FOOTBALL_DATA_TOKEN` Supabase secret. **Never** ships to the client.
- To swap providers later, only `db/functions/sync-matches/index.ts` changes.

## 4. Deploy on Vercel

1. Push the repo to GitHub.
2. Import in Vercel → framework preset **Vite**.
3. Set env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
4. Deploy. `vercel.json` provides SPA rewrites so `/leagues`, `/auth` etc. work on refresh.
5. Update Supabase Site URL / Redirect URLs to the live Vercel domain.

## 5. Scoring rules (per-league, admin-editable)

| Setting          | Default | Meaning                                |
|------------------|---------|----------------------------------------|
| `points_perfect` | **3**   | Exact score                            |
| `points_outcome` | **1**   | Correct winner / draw, wrong score     |
| `points_wrong`   | **0**   | Wrong outcome                          |
| `points_bonus`   | **5**   | Each correct tournament-long bonus bet |

Predictions are locked at kickoff by a DB trigger (`guard_prediction_lock`). Bonus
bets lock at `leagues.bonus_lock_at`.

## 6. Project layout

```
src/lib/supabase.ts             Supabase client
src/lib/database.types.ts       Hand-written DB types (regenerate via CLI)
src/providers/AuthProvider.tsx  Auth context
src/components/ProtectedRoute.tsx
src/hooks/useLeagues|useMatches|useLeaderboard|useBonusBets.ts
src/pages/{Index,Auth,Leagues}.tsx

db/migrations/                  SQL migrations for `supabase db push`
db/setup.sql                    Same SQL, paste into the SQL editor
db/functions/sync-matches/      Pull fixtures + score finished matches
db/functions/score-bonus/       Resolve bonus bets after admin sets answers
vercel.json                     SPA rewrites
.env.example                    Required env vars
```
